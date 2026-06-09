import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { cartApi } from "../api/cartApi.js";
import { toArabicError } from "../api/httpClient.js";
import { wishlistApi } from "../api/wishlistApi.js";
import AuthRequiredModal from "../components/AuthRequiredModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  productRequiresColor,
  productRequiresSize,
  resolveVariant,
} from "./variants.js";

const StoreContext = createContext(null);

function mergeCartItem(item, products) {
  const product = products.find((candidate) => candidate.id === item.productId);
  return {
    ...item,
    product: product ? { ...product, ...item.product, ...product } : item.product,
  };
}

export function StoreProvider({ children }) {
  const { products } = useCatalog();
  const { isAuthenticated, isCustomer } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [cart, setCart] = useState({ id: "", items: [], subtotal: 0, discountTotal: 0, total: 0 });
  const [wishlist, setWishlist] = useState({ id: "", items: [] });
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [authRequiredModalOpen, setAuthRequiredModalOpen] = useState(false);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) {
      setCart({ id: "", items: [], subtotal: 0, discountTotal: 0, total: 0 });
      return;
    }

    setCartLoading(true);
    try {
      setCart(await cartApi.get());
    } catch (error) {
      setCart({ id: "", items: [], subtotal: 0, discountTotal: 0, total: 0 });
      showToast({ type: "error", message: toArabicError(error) });
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated, isCustomer, showToast]);

  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) {
      setWishlist({ id: "", items: [] });
      return;
    }

    setWishlistLoading(true);
    try {
      setWishlist(await wishlistApi.get());
    } catch (error) {
      setWishlist({ id: "", items: [] });
      showToast({ type: "error", message: toArabicError(error) });
    } finally {
      setWishlistLoading(false);
    }
  }, [isAuthenticated, isCustomer, showToast]);

  useEffect(() => {
    loadCart();
    loadWishlist();
  }, [loadCart, loadWishlist]);

  useEffect(() => {
    if (isAuthenticated && isCustomer) {
      setAuthRequiredModalOpen(false);
    }
  }, [isAuthenticated, isCustomer]);

  const addToCart = useCallback(
    async (productId, quantity = 1, options = {}) => {
      if (!isAuthenticated || !isCustomer) {
        return { ok: false, reason: "auth" };
      }

      const product = products.find((candidate) => candidate.id === productId);
      const requested = Math.max(1, Number(quantity) || 1);
      const selectedColor = options.selectedColor ?? null;
      const selectedSize = options.selectedSize ?? null;

      if (!product) {
        showToast({ type: "error", message: "لم يتم العثور على العنصر" });
        return { ok: false, reason: "not_found" };
      }

      if (product.isActive === false || product.status === "Draft") {
        showToast({ type: "error", message: t("productUnavailable") });
        return { ok: false, reason: "unavailable" };
      }

      if (productRequiresColor(product) && !selectedColor) {
        showToast({ type: "error", message: t("selectColorValidation") });
        return { ok: false, reason: "color" };
      }

      if (productRequiresSize(product) && !selectedSize) {
        showToast({ type: "error", message: t("selectSizeValidation") });
        return { ok: false, reason: "size" };
      }

      const variant = resolveVariant(product, selectedColor, selectedSize);
      if ((product.variants ?? []).length > 0 && (productRequiresColor(product) || productRequiresSize(product)) && !variant) {
        showToast({ type: "error", message: t("variantUnavailable") });
        return { ok: false, reason: "variant" };
      }

      try {
        const nextCart = await cartApi.addItem({
          productId,
          productSizeId: selectedSize?.id ?? null,
          productColorId: selectedColor?.id ?? null,
          productVariantId: variant?.id ?? null,
          quantity: requested,
        });
        setCart(nextCart);
        return { ok: true };
      } catch (error) {
        showToast({ type: "error", message: toArabicError(error) });
        return { ok: false, reason: "api", message: toArabicError(error) };
      }
    },
    [isAuthenticated, isCustomer, products, showToast, t],
  );

  const updateQuantity = useCallback(
    async (lineId, quantity) => {
      if (!isAuthenticated || !isCustomer) return { ok: false };
      const nextQuantity = Number(quantity) || 0;

      try {
        if (nextQuantity <= 0) {
          await cartApi.deleteItem(lineId);
          await loadCart();
        } else {
          setCart(await cartApi.updateItem(lineId, nextQuantity));
        }
        return { ok: true };
      } catch (error) {
        showToast({ type: "error", message: toArabicError(error) });
        return { ok: false, message: toArabicError(error) };
      }
    },
    [isAuthenticated, isCustomer, loadCart, showToast],
  );

  const removeFromCart = useCallback(
    async (lineId) => {
      if (!isAuthenticated || !isCustomer) return { ok: false };

      try {
        await cartApi.deleteItem(lineId);
        await loadCart();
        return { ok: true };
      } catch (error) {
        showToast({ type: "error", message: toArabicError(error) });
        return { ok: false, message: toArabicError(error) };
      }
    },
    [isAuthenticated, isCustomer, loadCart, showToast],
  );

  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) return { ok: false };

    try {
      await cartApi.clear();
      setCart({ id: "", items: [], subtotal: 0, discountTotal: 0, total: 0 });
      return { ok: true };
    } catch (error) {
      showToast({ type: "error", message: toArabicError(error) });
      return { ok: false, message: toArabicError(error) };
    }
  }, [isAuthenticated, isCustomer, showToast]);

  const toggleWishlist = useCallback(
    async (productId) => {
      if (!isAuthenticated || !isCustomer) {
        return { ok: false, reason: "auth" };
      }

      const existing = wishlist.items.find((item) => item.productId === productId);
      try {
        if (existing) {
          await wishlistApi.deleteItem(existing.id);
          await loadWishlist();
        } else {
          setWishlist(await wishlistApi.addItem(productId));
        }
        return { ok: true };
      } catch (error) {
        showToast({ type: "error", message: toArabicError(error) });
        return { ok: false, message: toArabicError(error) };
      }
    },
    [isAuthenticated, isCustomer, loadWishlist, showToast, wishlist.items],
  );

  const cartDetailed = useMemo(
    () => cart.items.map((item) => mergeCartItem(item, products)),
    [cart.items, products],
  );

  const wishlistProducts = useMemo(
    () =>
      wishlist.items.map((item) => {
        const product = products.find((candidate) => candidate.id === item.productId);
        return product ?? item.product;
      }),
    [products, wishlist.items],
  );

  const wishlistIds = useMemo(
    () => wishlist.items.map((item) => item.productId),
    [wishlist.items],
  );

  const cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);
  const calculatedSubtotal = cart.items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
  const cartSubtotal = cart.subtotal || calculatedSubtotal;
  const cartDiscountTotal = cart.discountTotal || 0;
  const cartTotal = cart.total || Math.max(0, cartSubtotal - cartDiscountTotal);

  const value = {
    cartItems: cart.items,
    cartDetailed,
    cartCount,
    cartSubtotal,
    cartDiscountTotal,
    cartTotal,
    cart,
    cartLoading,
    wishlistIds,
    wishlistProducts,
    wishlistCount: wishlist.items.length,
    wishlistLoading,
    refreshCart: loadCart,
    refreshWishlist: loadWishlist,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    openAuthRequiredModal: () => setAuthRequiredModalOpen(true),
    closeAuthRequiredModal: () => setAuthRequiredModalOpen(false),
    toggleWishlist,
    isWishlisted: (productId) => wishlistIds.includes(productId),
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
      <AuthRequiredModal
        open={authRequiredModalOpen}
        onClose={() => setAuthRequiredModalOpen(false)}
      />
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }

  return context;
}
