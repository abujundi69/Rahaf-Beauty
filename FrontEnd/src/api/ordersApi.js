import { httpClient } from "./httpClient.js";
import {
  extractItems,
  normalizeOrder,
  normalizeReorderResult,
  toBackendOrderStatus,
} from "./normalizers.js";

export const ordersApi = {
  async create(payload) {
    return normalizeOrder(await httpClient.post("/orders", payload));
  },

  async my() {
    const result = await httpClient.get("/orders/my");
    return (result ?? []).map(normalizeOrder).filter(Boolean);
  },

  async get(id) {
    return normalizeOrder(await httpClient.get(`/orders/${id}`));
  },

  async reorder(id) {
    return normalizeReorderResult(await httpClient.post(`/orders/${id}/reorder`));
  },

  async adminList(params = {}) {
    const result = await httpClient.get("/admin/orders", { params });
    return {
      ...result,
      items: extractItems(result).map(normalizeOrder).filter(Boolean),
    };
  },

  async adminGet(id) {
    return normalizeOrder(await httpClient.get(`/admin/orders/${id}`));
  },

  async approve(id) {
    return normalizeOrder(await httpClient.put(`/admin/orders/${id}/approve`));
  },

  async reject(id, note = "") {
    return normalizeOrder(await httpClient.put(`/admin/orders/${id}/reject`, { note }));
  },

  async updateStatus(id, status, note = "") {
    return normalizeOrder(
      await httpClient.put(`/admin/orders/${id}/status`, {
        status: toBackendOrderStatus(status),
        note,
      }),
    );
  },
};
