import { Eye, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "./Badge.jsx";
import ProductVisual from "./ProductVisual.jsx";
import RatingStars from "./RatingStars.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useStoreSettings } from "../context/StoreSettingsContext.jsx";
import {
  formatPrice,
  getBrandName,
  getProductName,
  toProductSlug,
  translateAvailability,
} from "../utils/catalog.js";
import { calculateProductPricing, getDiscountBadge } from "../utils/pricing.js";
import { useStore } from "../utils/store.jsx";
import { cn } from "../utils/cn.js";

export default function ProductCard({ product, compact = false }) {
  const { toggleWishlist, isWishlisted, openAuthRequiredModal } = useStore();
  const { isAdmin, isAuthenticated, isCustomer } = useAuth();
  const { language, t } = useLanguage();
  const { settings } = useStoreSettings();
  const wished = isWishlisted(product.id);
  const name = getProductName(product, language);
  const pricing = calculateProductPricing(product, settings);
  const discountBadge = getDiscountBadge(pricing, language);
  const productPath = `/product/${toProductSlug(product)}`;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-petal/70 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-terracotta/35 hover:shadow-card">
      <div className="relative shrink-0">
        <Link
          to={productPath}
          className="block"
          aria-label={name}
        >
          <ProductVisual
            product={product}
            className={cn("w-full rounded-xl", compact ? "aspect-square" : "aspect-square")}
          />
          <div className="absolute start-2 top-2 flex gap-1.5">
            {pricing.hasDiscount ? <Badge tone="sale">{discountBadge}</Badge> : null}
            {product.isNew ? <Badge tone="new">{t("new")}</Badge> : null}
          </div>
        </Link>

        {!isAdmin ? (
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated || !isCustomer) {
                openAuthRequiredModal();
                return;
              }
              toggleWishlist(product.id);
            }}
            className={cn(
              "absolute end-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-muted shadow-sm backdrop-blur transition hover:bg-white hover:text-ink",
              wished && "bg-clay text-white hover:bg-terracotta hover:text-white",
            )}
            aria-label={t("wishlist")}
          >
            <Heart
              className="h-3.5 w-3.5"
              fill={wished ? "currentColor" : "none"}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <Link to={productPath} className="block min-w-0">
          <p className="h-4 truncate text-[0.68rem] font-bold uppercase text-terracotta">
            {getBrandName(product.brand)}
          </p>
          <h3 className="line-clamp-2 mt-1 min-h-[2.5rem] text-[0.94rem] font-extrabold leading-5 text-ink transition group-hover:text-terracotta">
            {name}
          </h3>
        </Link>

        <div className="mt-2 flex min-h-5 items-center justify-between gap-2">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} compact />
          <span className="truncate text-[0.7rem] font-semibold text-muted">
            {translateAvailability(product.availability, t)}
          </span>
        </div>

        <div className="mt-auto pt-4">
          <div className="min-w-0">
            <p className="text-base font-extrabold leading-none text-ink">
              {formatPrice(pricing.finalPrice, language)}
            </p>
            {pricing.hasDiscount ? (
              <p className="mt-1 text-xs font-semibold text-muted line-through">
                {formatPrice(pricing.originalPrice, language)}
              </p>
            ) : null}
          </div>
        </div>
        {!isAdmin ? (
          <div className="mt-3 h-10">
            <Link
              to={productPath}
              className="inline-flex h-10 w-full min-w-0 items-center justify-center gap-1.5 rounded-xl bg-charcoal px-3 text-xs font-extrabold text-white transition hover:bg-ink"
            >
              <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{t("viewProduct")}</span>
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
