import { Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { reviewsApi } from "../api/reviewsApi.js";
import { toArabicError } from "../api/httpClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { cn } from "../utils/cn.js";
import { formatDate, formatNumber } from "../utils/format.js";
import { useStore } from "../utils/store.jsx";

function StaticStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5 text-terracotta">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className="h-4 w-4"
          fill={star <= Number(rating) ? "currentColor" : "none"}
          strokeWidth={2}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function ProductReviews({ product, onReviewCreated }) {
  const { isAuthenticated, isCustomer, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { openAuthRequiredModal } = useStore();
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(product.reviewCount ?? 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await reviewsApi.getProductReviews(product.id, {
        page: 1,
        pageSize: 20,
      });
      setReviews(result.items);
      setTotal(result.total);
    } catch (requestError) {
      setReviews([]);
      setError(toArabicError(requestError));
    } finally {
      setLoading(false);
    }
  }, [product.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const submit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!isAuthenticated || !isCustomer) {
      openAuthRequiredModal();
      return;
    }

    if (rating < 1 || rating > 5) {
      setFormError(t("reviewRatingRequired"));
      return;
    }

    setSubmitting(true);
    try {
      await reviewsApi.createProductReview(product.id, {
        rating,
        comment: comment.trim() || null,
        orderId: null,
      });
      setRating(0);
      setComment("");
      await loadReviews();
      await onReviewCreated?.();
      showToast({ type: "success", message: t("reviewSubmitted") });
    } catch (requestError) {
      setFormError(toArabicError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-ink">{t("reviews")}</p>
          <p className="mt-1 text-xs font-semibold text-muted">
            {formatNumber(total)} {t("reviews")}
          </p>
        </div>
      </div>

      {!isAdmin ? (
        <form onSubmit={submit} className="rounded-[1.2rem] border border-petal/60 bg-ivory/80 p-4">
          <p className="text-sm font-extrabold text-ink">{t("writeReview")}</p>
          {isAuthenticated && isCustomer ? (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setRating(value);
                      setFormError("");
                    }}
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-full border transition",
                      value <= rating
                        ? "border-terracotta bg-shell text-terracotta shadow-sm"
                        : "border-petal bg-white text-muted hover:border-terracotta",
                    )}
                    aria-label={`${value} من 5`}
                  >
                    <Star
                      className="h-4 w-4"
                      fill={value <= rating ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
              <label className="mt-4 block text-sm font-bold text-ink">
                {t("reviewComment")}
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  className="mt-2 min-h-28 w-full rounded-[1.1rem] bg-white px-4 py-3 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/70"
                />
              </label>
              {formError ? (
                <p className="mt-3 rounded-2xl bg-sale/10 px-4 py-3 text-sm font-bold text-sale">
                  {formError}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-clay to-terracotta px-5 text-sm font-extrabold text-white shadow-card transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? t("loading") : t("submitReview")}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={openAuthRequiredModal}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-clay to-terracotta px-5 text-sm font-extrabold text-white shadow-card transition hover:-translate-y-0.5"
            >
              {t("loginToReview")}
            </button>
          )}
        </form>
      ) : null}

      {loading ? (
        <div className="rounded-2xl bg-shell p-6 text-center text-sm font-bold text-muted">
          {t("loading")}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl bg-sale/10 p-4 text-sm font-bold text-sale">
          {error}
        </div>
      ) : null}

   

      <div className="grid gap-3">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-2xl border border-petal bg-white/95 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-ink">{review.customerName}</p>
                <p className="mt-1 text-xs font-semibold text-muted">
                  {formatDate(review.createdAt)}
                </p>
              </div>
              <StaticStars rating={review.rating} />
            </div>
            {review.comment ? (
              <p className="mt-3 text-sm leading-7 text-muted">{review.comment}</p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
