import { Heart } from "lucide-react";
import { useState } from "react";
import AddToCartButton from "./AddToCartButton.jsx";
import Badge from "./Badge.jsx";
import Button from "./Button.jsx";
import ProductGallery from "./ProductGallery.jsx";
import ProductGrid from "./ProductGrid.jsx";
import ProductReviews from "./ProductReviews.jsx";
import QuantitySelector from "./QuantitySelector.jsx";
import RatingStars from "./RatingStars.jsx";
import SectionHeader from "./SectionHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useStoreSettings } from "../context/StoreSettingsContext.jsx";
import {
  formatPrice,
  getBrandName,
  getProductDescription,
  getProductName,
  translateAvailability,
} from "../utils/catalog.js";
import { calculateProductPricing, getDiscountBadge } from "../utils/pricing.js";
import { useStore } from "../utils/store.jsx";
import { cn } from "../utils/cn.js";
import {
  getColorName,
  getSizeLabel,
  getSizePriceOverride,
  productRequiresColor,
  productRequiresSize,
  resolveVariant,
} from "../utils/variants.js";

export default function ProductDetails({ product, relatedProducts = [], onProductReload }) {
  const { language, t } = useLanguage();
  const { settings } = useStoreSettings();
  const { isAdmin, isAuthenticated, isCustomer } = useAuth();
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [validationError, setValidationError] = useState("");
  const { toggleWishlist, isWishlisted, openAuthRequiredModal } = useStore();
  const wished = isWishlisted(product.id);
  const productName = getProductName(product, language);
  const description = getProductDescription(product, language);
  const pricing = calculateProductPricing(product, settings, { selectedSize });
  const discountBadge = getDiscountBadge(pricing, language);
  const requiresColor = productRequiresColor(product);
  const requiresSize = productRequiresSize(product);
  const hasVariants = (product.variants ?? []).length > 0;
  const hasCompleteSelection =
    (!requiresColor || selectedColor) && (!requiresSize || selectedSize);
  const variantUnavailable =
    hasVariants && hasCompleteSelection && !resolveVariant(product, selectedColor, selectedSize);
  const unavailable = variantUnavailable || product.isActive === false || product.status === "Draft";
  const tabs = [
    { id: "description", label: t("description"), content: description || t("noData") },
    {
      id: "ingredients",
      label: t("ingredients"),
      content: product.ingredientsAr || product.ingredients || t("noData"),
    },
    {
      id: "howToUse",
      label: t("howToUse"),
      content: product.howToUseAr || product.howToUse || t("noData"),
    },
    { id: "reviews", label: t("reviews"), content: "" },
  ];

  return (
    <>
      <section className="container-page py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <ProductGallery product={product} />

          <div className="beauty-shell p-6 md:p-8">
            <div className="flex flex-wrap gap-2">
              {pricing.hasDiscount ? <Badge tone="sale">{discountBadge}</Badge> : null}
              {product.isNew ? <Badge tone="new">{t("new")}</Badge> : null}
              <Badge tone="neutral">{translateAvailability(product.availability, t)}</Badge>
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-terracotta">
              {getBrandName(product.brand)}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink md:text-5xl">
              {productName}
            </h1>
            <div className="mt-4">
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-extrabold text-ink">
                {formatPrice(pricing.finalPrice, language)}
              </span>
              {pricing.hasDiscount ? (
                <span className="pb-1 text-lg font-bold text-muted line-through">
                  {formatPrice(pricing.originalPrice, language)}
                </span>
              ) : null}
            </div>

            <p className="mt-6 text-base leading-7 text-muted">{description}</p>

            {requiresColor || requiresSize ? (
              <div className="mt-7 space-y-5">
                {requiresColor ? (
                  <div>
                    <p className="text-sm font-extrabold text-ink">{t("selectColor")}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(product.colors ?? []).map((color) => {
                        const selected = selectedColor?.id === color.id;
                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => {
                              setSelectedColor(color);
                              setValidationError("");
                            }}
                            className={cn(
                              "inline-flex min-h-11 items-center gap-2 rounded-2xl border px-3 text-sm font-bold transition",
                              selected
                                ? "border-clay bg-gradient-to-r from-clay to-terracotta text-white shadow-sm"
                                : "border-petal bg-ivory text-ink hover:border-terracotta",
                            )}
                          >
                            <span
                              className="h-5 w-5 rounded-full border border-petal"
                              style={{ backgroundColor: color.hex }}
                              aria-hidden="true"
                            />
                            {getColorName(color, language)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {requiresSize ? (
                  <div>
                    <p className="text-sm font-extrabold text-ink">{t("selectSize")}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(product.sizes ?? []).map((size) => {
                        const selected = selectedSize?.id === size.id;
                        const sizePricing = calculateProductPricing(product, settings, {
                          selectedSize: size,
                        });
                        const hasPriceOverride = Boolean(getSizePriceOverride(size));
                        return (
                          <button
                            key={size.id}
                            type="button"
                            onClick={() => {
                              setSelectedSize(size);
                              setQuantity(1);
                              setValidationError("");
                            }}
                            className={cn(
                              "min-h-11 rounded-2xl border px-4 py-2 text-sm font-extrabold transition",
                              selected
                                ? "border-clay bg-gradient-to-r from-clay to-terracotta text-white shadow-sm"
                                : "border-petal bg-ivory text-ink hover:border-terracotta",
                            )}
                          >
                            <span className="block">{getSizeLabel(size)}</span>
                            {hasPriceOverride ? (
                              <span className={cn("mt-1 block text-xs", selected ? "text-white/75" : "text-muted")}>
                                {formatPrice(sizePricing.finalPrice, language)}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {validationError ? (
                  <p className="rounded-2xl bg-shell px-4 py-3 text-sm font-bold text-sale">
                    {validationError === "color"
                      ? t("selectColorValidation")
                      : t("selectSizeValidation")}
                  </p>
                ) : null}
                {variantUnavailable ? (
                  <p className="rounded-2xl bg-shell px-4 py-3 text-sm font-bold text-sale">
                    {t("variantUnavailable")}
                  </p>
                ) : null}
              </div>
            ) : null}

            {!isAdmin ? (
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  max={99}
                  size="lg"
                  disabled={unavailable}
                />
                <AddToCartButton
                  productId={product.id}
                  quantity={quantity}
                  disabled={unavailable}
                  selectedColor={selectedColor}
                  selectedSize={selectedSize}
                  requireColor={requiresColor}
                  requireSize={requiresSize}
                  onValidationError={(reason) => setValidationError(reason)}
                  className="min-w-[12rem] flex-1 sm:flex-none"
                />
                <Button
                  variant={wished ? "primary" : "outline"}
                  size="icon"
                  onClick={() => {
                    if (!isAuthenticated || !isCustomer) {
                      openAuthRequiredModal();
                      return;
                    }
                    toggleWishlist(product.id);
                  }}
                  aria-label={t("wishlist")}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={wished ? "currentColor" : "none"}
                    aria-hidden="true"
                  />
                </Button>
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-petal/60 bg-ivory/80 px-4 py-3 text-sm font-bold text-muted">
                {t("adminShoppingBlocked")}
              </div>
            )}

          </div>
        </div>

        <div className="mt-10 beauty-shell p-5 md:p-7">
          <div className="flex flex-wrap gap-2 border-b border-petal pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-bold transition",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-clay to-terracotta text-white shadow-sm"
                    : "bg-ivory text-muted hover:bg-shell hover:text-ink",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {activeTab === "reviews" ? (
            <div className="mt-5">
              <ProductReviews product={product} onReviewCreated={onProductReload} />
            </div>
          ) : (
            <p className="mt-5 max-w-3xl text-sm leading-7 text-muted md:text-base">
              {tabs.find((tab) => tab.id === activeTab)?.content}
            </p>
          )}
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="container-page py-8">
          <SectionHeader
            eyebrow={t("completeRitual")}
            title={t("relatedProducts")}
          />
          <ProductGrid products={relatedProducts} />
        </section>
      ) : null}
    </>
  );
}
