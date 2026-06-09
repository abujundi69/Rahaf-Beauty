const clampRating = (value) => Math.min(5, Math.max(0, Number(value) || 0));

export function normalizeReviews(product) {
  if (Array.isArray(product.reviews)) {
    return product.reviews
      .map((review, index) => ({
        id: review.id ?? `${product.id}-review-${index + 1}`,
        rating: clampRating(review.rating),
        comment: review.comment ?? "",
        customerName: review.customerName ?? "",
        createdAt: review.createdAt ?? new Date().toISOString(),
      }))
      .filter((review) => review.rating > 0);
  }

  return [];
}

export function getRatingSummary(reviews = []) {
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const reviewCount = safeReviews.length;

  if (reviewCount === 0) {
    return {
      averageRating: 0,
      reviewCount: 0,
    };
  }

  const total = safeReviews.reduce(
    (sum, review) => sum + clampRating(review.rating),
    0,
  );

  return {
    averageRating: total / reviewCount,
    reviewCount,
  };
}
