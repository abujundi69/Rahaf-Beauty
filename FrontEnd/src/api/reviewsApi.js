import { httpClient } from "./httpClient.js";
import { normalizePagedReviews, normalizeReview } from "./normalizers.js";

export const reviewsApi = {
  async getProductReviews(productId, params = {}) {
    return normalizePagedReviews(await httpClient.get(`/products/${productId}/reviews`, { params }));
  },

  async createProductReview(productId, payload) {
    return normalizeReview(await httpClient.post(`/products/${productId}/reviews`, payload));
  },
};
