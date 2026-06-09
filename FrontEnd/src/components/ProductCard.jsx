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
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.35rem] border border-petal/70 bg-white/95 p-3.5 shadow-[0_10px_28px_rgba(190,24,93,0.08)] transition duration-300 hover:-translate-y-1 hover:border-clay/40 hover:shadow-card">
      <div className="relative shrink-0">
        <Link
          to={productPath}
          className="block"
          aria-label={name}
        >
          <ProductVisual
            product={product}
            className={cn(
              "w-full rounded-[1.1rem] ring-1 ring-petal/50 transition duration-500 group-hover:ring-clay/30 group-hover:[&_img]:scale-[1.04]",
              compact ? "aspect-square" : "aspect-square",
            )}
          />
          <div className="absolute start-2 top-2 flex flex-wrap gap-1.5">
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
              "absolute end-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-muted shadow-sm ring-1 ring-petal/60 backdrop-blur transition hover:scale-105 hover:bg-shell hover:text-terracotta",
              wished && "bg-clay text-white ring-clay hover:bg-terracotta hover:text-white",
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

      <div className="flex flex-1 flex-col pt-3.5">
        <Link to={productPath} className="block min-w-0">
          <p className="h-4 truncate text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-terracotta">
            {getBrandName(product.brand)}
          </p>
          <h3 className="line-clamp-2 mt-1.5 min-h-[2.6rem] text-[0.98rem] font-extrabold leading-5 text-ink transition group-hover:text-terracotta">
            {name}
          </h3>
        </Link>

        <div className="mt-3 flex min-h-5 items-center justify-between gap-2">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} compact />
          <span className="truncate text-[0.7rem] font-semibold text-muted">
            {translateAvailability(product.availability, t)}
          </span>
        </div>

        <div className="mt-auto pt-4">
          <div className="min-w-0 rounded-2xl bg-ivory/80 px-3 py-2.5 ring-1 ring-petal/50">
            <p className="text-lg font-extrabold leading-none text-ink">
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
              className="inline-flex h-10 w-full min-w-0 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-clay to-terracotta px-3 text-xs font-extrabold text-white shadow-[0_10px_22px_rgba(219,39,119,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(219,39,119,0.26)]"
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
