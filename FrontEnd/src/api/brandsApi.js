import { httpClient } from "./httpClient.js";
import { normalizeBrand } from "./normalizers.js";

function appendFormValue(formData, key, value) {
  if (value !== undefined && value !== null && value !== "") {
    formData.append(key, String(value));
  }
}

function toBrandFormData(payload) {
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

export const brandsApi = {
  async list() {
    const result = await httpClient.get("/brands");
    return (result ?? []).map(normalizeBrand).filter(Boolean);
  },

  async adminList() {
    const result = await httpClient.get("/admin/brands");
    return (result ?? []).map(normalizeBrand).filter(Boolean);
  },

  async create(payload) {
    const result = await httpClient.post("/admin/brands", toBrandFormData(payload));
    return normalizeBrand(result);
  },

  async update(id, payload) {
    const result = await httpClient.put(`/admin/brands/${id}`, toBrandFormData(payload));
    return normalizeBrand(result);
  },

  delete(id) {
    return httpClient.delete(`/admin/brands/${id}`);
  },
};
