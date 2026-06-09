import { httpClient } from "./httpClient.js";
import { normalizeCategory } from "./normalizers.js";

function appendFormValue(formData, key, value) {
  if (value !== undefined && value !== null && value !== "") {
    formData.append(key, String(value));
  }
}

function toCategoryFormData(payload) {
  if (payload instanceof FormData) return payload;

  const formData = new FormData();
  appendFormValue(formData, "name", payload.name);
  appendFormValue(formData, "slug", payload.slug);
  appendFormValue(formData, "description", payload.description);
  appendFormValue(formData, "imageUrl", payload.imageUrl);
  if (payload.isActive !== undefined && payload.isActive !== null) {
    formData.append("isActive", String(Boolean(payload.isActive)));
  }
  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }
  return formData;
}

export const categoriesApi = {
  async list() {
    const result = await httpClient.get("/categories");
    return (result ?? []).map(normalizeCategory).filter(Boolean);
  },

  async adminList() {
    const result = await httpClient.get("/admin/categories");
    return (result ?? []).map(normalizeCategory).filter(Boolean);
  },

  async create(payload) {
    const result = await httpClient.post("/admin/categories", toCategoryFormData(payload));
    return normalizeCategory(result);
  },

  async update(id, payload) {
    const result = await httpClient.put(`/admin/categories/${id}`, toCategoryFormData(payload));
    return normalizeCategory(result);
  },

  delete(id) {
    return httpClient.delete(`/admin/categories/${id}`);
  },
};
