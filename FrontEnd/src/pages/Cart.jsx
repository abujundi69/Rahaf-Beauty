import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import CartSummary from "../components/CartSummary.jsx";
import ProductVisual from "../components/ProductVisual.jsx";
import QuantitySelector from "../components/QuantitySelector.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import {
  formatPrice,
  getBrandName,
  getProductName,
  toProductSlug,
  translateAvailability,
} from "../utils/catalog.js";
import { formatNumber } from "../utils/format.js";
import { useStore } from "../utils/store.jsx";
import { getColorName, getSizeLabel } from "../utils/variants.js";

export default function Cart() {
  const { isAdmin } = useAuth();
  const { language, t } = useLanguage();
  const {
    cartDetailed,
    cartCount,
    cartSubtotal,
    cartDiscountTotal,
    cartTotal,
    updateQuantity,
    removeFromCart,
  } = useStore();

  if (isAdmin) {
    return (
      <section className="container-page py-16 text-center">
        <div className="mx-auto max-w-xl beauty-shell p-8">
          <h1 className="font-display text-3xl font-bold text-ink">
            {t("notAvailableForAdmin")}
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            {t("adminShoppingBlocked")}
          </p>
          <Button as={Link} to="/admin" className="mt-6">
            {t("adminDashboard")}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="container-page py-10 md:py-14">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
            {t("cart")}
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-ink">
            سلة التوهج
          </h1>
          <p className="mt-2 text-sm font-bold text-muted">
            {formatNumber(cartCount)} {t("items")}
          </p>
        </div>
        <Button as={Link} to="/shop" variant="outline">
          {t("continueShopping")}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cartDetailed.length === 0 ? (
            <div className="beauty-shell p-10 text-center">
              <h2 className="font-display text-3xl font-bold text-ink">
                سلتك فارغة
              </h2>
              <p className="mt-3 text-sm text-muted">
                أضيفي عناية أو مكياجا أو عطرا ناعما للبدء.
              </p>
            </div>
          ) : (
            cartDetailed.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-[1.25rem] border border-petal/70 bg-white/95 p-4 shadow-sm transition hover:border-clay/40 hover:bg-shell/40 sm:grid-cols-[8rem_1fr_auto]"
                >
                  <ProductVisual product={item.product} className="aspect-square" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-terracotta">
                      {getBrandName(item.product.brand)}
                    </p>
                    <Link to={`/product/${toProductSlug(item.product)}`}>
                      <h2 className="mt-1 text-lg font-extrabold text-ink">
                        {getProductName(item.product, language)}
                      </h2>
                    </Link>
                    <p className="mt-2 text-sm text-muted">
                      {translateAvailability(item.product.availability, t)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-muted">
                      {item.selectedColor ? (
                        <span className="rounded-full bg-ivory px-3 py-1">
                          {t("color")}: {getColorName(item.selectedColor, language)}
                        </span>
                      ) : null}
                      {item.selectedSize ? (
                        <span className="rounded-full bg-ivory px-3 py-1">
                          {t("size")}: {getSizeLabel(item.selectedSize)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-lg font-extrabold text-ink">
                      {formatPrice(item.unitPrice, language)}
                    </p>
                    {item.originalUnitPrice > item.unitPrice ? (
                      <p className="mt-1 text-xs font-semibold text-muted line-through">
                        {formatPrice(item.originalUnitPrice, language)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(value) => updateQuantity(item.id, value)}
                      max={99}
                    />
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="grid h-10 w-10 place-items-center rounded-full bg-shell text-muted transition hover:bg-sale hover:text-white"
                      aria-label={t("remove")}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </article>
            ))
          )}
        </div>
        <CartSummary subtotal={cartSubtotal} discountTotal={cartDiscountTotal} total={cartTotal} />
      </div>
    </section>
  );
}
