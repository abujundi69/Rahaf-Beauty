import { Star } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { formatDecimal, formatNumber } from "../utils/format.js";

export default function RatingStars({ rating, reviewCount, compact = false }) {
  const { t } = useLanguage();
  const hasReviews = Number(reviewCount) > 0;

  if (!hasReviews) {
    return (
      <div className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-muted">
        <div className="flex items-center gap-0.5 text-petal">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="h-3.5 w-3.5"
              fill="none"
              strokeWidth={2}
              aria-hidden="true"
            />
          ))}
        </div>
        <span className={compact ? "truncate text-[0.68rem]" : ""}>{t("noReviewsYet")}</span>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-1.5 text-sm">
      <div className="flex items-center gap-0.5 text-terracotta">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className="h-3.5 w-3.5"
            fill={star <= Math.round(rating) ? "currentColor" : "none"}
            strokeWidth={2}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="font-semibold text-ink">{formatDecimal(rating, 1)}</span>
      {!compact ? <span className="text-muted">({formatNumber(reviewCount)})</span> : null}
    </div>
  );
}
