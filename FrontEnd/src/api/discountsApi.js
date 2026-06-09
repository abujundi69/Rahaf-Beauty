import { httpClient } from "./httpClient.js";

function normalizeDiscount(discount) {
  return {
    id: String(discount.id),
    type: discount.type,
    scopeId: discount.scopeId ? String(discount.scopeId) : "",
    percentage: discount.percentage ?? "",
    label: discount.label ?? "",
    isEnabled: Boolean(discount.isEnabled),
    startDate: discount.startDate ? String(discount.startDate).slice(0, 10) : "",
    endDate: discount.endDate ? String(discount.endDate).slice(0, 10) : "",
  };
}

export const discountsApi = {
  async list() {
    const result = await httpClient.get("/admin/discounts");
    return (result ?? []).map(normalizeDiscount);
  },

  async create(payload) {
    return normalizeDiscount(await httpClient.post("/admin/discounts", payload));
  },

  async update(id, payload) {
    return normalizeDiscount(await httpClient.put(`/admin/discounts/${id}`, payload));
  },

  delete(id) {
    return httpClient.delete(`/admin/discounts/${id}`);
  },
};
