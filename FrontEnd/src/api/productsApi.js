import { httpClient } from "./httpClient.js";
import { extractItems, normalizeProduct } from "./normalizers.js";

function normalizePagedProducts(result) {
  return {
    ...result,
    items: extractItems(result).map(normalizeProduct).filter(Boolean),
  };
}

export const productsApi = {
  async list(params = {}) {
    const result = await httpClient.get("/products", { params });
    return normalizePagedProducts(result);
  },

  async mostOrdered(limit = 4) {
    const result = await httpClient.get("/products/most-ordered", {
      params: { limit },
    });
    return (result ?? []).map(normalizeProduct).filter(Boolean);
  },

  async adminList(params = {}) {
    const result = await httpClient.get("/admin/products", { params });
    return normalizePagedProducts(result);
  },

  async getById(id) {
    const result = await httpClient.get(`/products/${id}`);
    return normalizeProduct(result);
  },

  async getBySlug(slug) {
    const result = await httpClient.get(`/products/by-slug/${slug}`);
    return normalizeProduct(result);
  },

  async search(params = {}) {
    const result = await httpClient.get("/products/search", { params });
    return normalizePagedProducts(result);
  },
};
