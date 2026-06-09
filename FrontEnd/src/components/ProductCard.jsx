import { Eye, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import AddToCartButton from "./AddToCartButton.jsx";
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

export default function ProductCard({ product, compact = false, variant = "store" }) {
  const { toggleWishlist, isWishlisted, openAuthRequiredModal } = useStore();
  const { isAdmin, isAuthenticated, isCustomer } = useAuth();
  const { language, t } = useLanguage();
  const { settings } = useStoreSettings();
  const wished = isWishlisted(product.id);
  const name = getProductName(product, language);
  const pricing = calculateProductPricing(product, settings);
  const discountBadge = getDiscountBadge(pricing, language);
  const productPath = `/product/${toProductSlug(product)}`;
  const isHome = compact || variant === "home";

  return (
    <article
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden border border-petal/70 bg-white/95 shadow-[0_12px_30px_rgba(190,24,93,0.08)] transition duration-300 hover:-translate-y-1 hover:border-clay/40 hover:shadow-card",
        isHome
          ? "rounded-[1.1rem] p-3 sm:p-3.5"
          : "rounded-[1.35rem] p-4 sm:p-5",
      )}
    >
      <div className="relative shrink-0">
        <Link
          to={productPath}
          className="block"
          aria-label={name}
        >
          <ProductVisual
            product={product}
            className={cn(
              "w-full rounded-[1.1rem] ring-1 ring-petal/50 transition duration-500 group-hover:ring-clay/30",
              isHome ? "aspect-square" : "aspect-[4/5]",
            )}
            imageClassName={cn(
              "object-contain group-hover:scale-[1.04]",
              isHome ? "p-2.5" : "p-3.5",
            )}
          />
          <div className={cn("absolute flex flex-wrap gap-1.5", isHome ? "start-1.5 top-1.5" : "start-2 top-2")}>
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
              "absolute grid place-items-center rounded-full bg-white/95 text-muted shadow-sm ring-1 ring-petal/60 backdrop-blur transition hover:scale-105 hover:bg-shell hover:text-terracotta",
              isHome ? "end-1.5 top-1.5 h-8 w-8" : "end-2 top-2 h-9 w-9",
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

      <div className={cn("flex flex-1 flex-col", isHome ? "pt-3" : "pt-3.5")}>
        <Link to={productPath} className="block min-w-0">
          <p
            className={cn(
              "h-4 truncate font-extrabold uppercase text-terracotta",
              isHome ? "text-[0.62rem] tracking-[0.12em]" : "text-[0.68rem] tracking-[0.16em]",
            )}
          >
            {getBrandName(product.brand)}
          </p>
          <h3
            className={cn(
              "line-clamp-2 mt-1.5 font-extrabold text-ink transition group-hover:text-terracotta",
              isHome ? "min-h-[2.35rem] text-[0.88rem] leading-[1.15rem]" : "min-h-[2.8rem] text-[1.05rem] leading-6",
            )}
          >
            {name}
          </h3>
        </Link>

        <div className={cn("flex min-h-5 items-center justify-between gap-2", isHome ? "mt-2.5" : "mt-3")}>
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} compact />
          <span className={cn("truncate font-semibold text-muted", isHome ? "text-[0.64rem]" : "text-[0.7rem]")}>
            {translateAvailability(product.availability, t)}
          </span>
        </div>

        <div className={cn("mt-auto", isHome ? "pt-3.5" : "pt-5")}>
          <div
            className={cn(
              "min-w-0 bg-ivory/80 ring-1 ring-petal/50",
              isHome ? "rounded-xl px-3 py-2.5" : "rounded-2xl px-3.5 py-3",
            )}
          >
            <p className={cn("font-extrabold leading-none text-ink", isHome ? "text-base" : "text-xl")}>
              {formatPrice(pricing.finalPrice, language)}
            </p>
            {pricing.hasDiscount ? (
              <p className={cn("mt-1 font-semibold text-muted line-through", isHome ? "text-[0.68rem]" : "text-xs")}>
                {formatPrice(pricing.originalPrice, language)}
              </p>
            ) : null}
          </div>
        </div>
        {!isAdmin ? (
          <div className={cn("grid gap-2", isHome ? "mt-2.5 grid-cols-[1fr_2.25rem]" : "mt-3 grid-cols-[1fr_2.75rem]")}>
            <AddToCartButton
              product={product}
              productId={product.id}
              size={isHome ? "xs" : "sm"}
              className={cn("w-full min-w-0", isHome ? "h-9" : "h-11")}
            />
            <Link
              to={productPath}
              className={cn(
                "inline-flex min-w-0 items-center justify-center rounded-full border border-clay/25 bg-white text-terracotta shadow-sm transition hover:-translate-y-0.5 hover:border-clay hover:bg-shell/70",
                isHome ? "h-9 w-9" : "h-11 w-11",
              )}
              aria-label={t("viewProduct")}
            >
              <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
