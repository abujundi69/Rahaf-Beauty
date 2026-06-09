import { httpClient } from "./httpClient.js";
import { extractItems, normalizeProduct } from "./normalizers.js";

export const adminApi = {
  async listCustomers() {
    const result = await httpClient.get("/admin/customers");
    return extractItems(result).map((customer) => ({
      id: String(customer.id),
      fullName: customer.fullName ?? "",
      phoneNumber: customer.phoneNumber ?? "",
      ordersCount: Number(customer.ordersCount) || 0,
      totalSpent: Number(customer.totalSpent) || 0,
      createdAt: customer.createdAt,
      status: "Active",
    }));
  },

  async createProduct(payload) {
    return normalizeProduct(await httpClient.post("/admin/products", payload));
  },

  async updateProduct(id, payload) {
    return normalizeProduct(await httpClient.put(`/admin/products/${id}`, payload));
  },

  deleteProduct(id) {
    return httpClient.delete(`/admin/products/${id}`);
  },

  async uploadProductImage(productId, file, { altText = "", sortOrder = 0 } = {}) {
    const body = new FormData();
    body.append("file", file);
    if (altText) body.append("altText", altText);
    body.append("sortOrder", String(sortOrder));
    return httpClient.post(`/admin/products/${productId}/images`, body);
  },

  deleteProductImage(productId, imageId) {
    return httpClient.delete(`/admin/products/${productId}/images/${imageId}`);
  },

  async uploadProductVideo(productId, file, { sortOrder = 0 } = {}) {
    const body = new FormData();
    body.append("file", file);
    body.append("sortOrder", String(sortOrder));
    return httpClient.post(`/admin/products/${productId}/video`, body);
  },

  deleteProductVideo(productId, videoId) {
    return httpClient.delete(`/admin/products/${productId}/video/${videoId}`);
  },
};
