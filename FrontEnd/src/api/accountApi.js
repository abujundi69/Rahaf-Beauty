import { httpClient } from "./httpClient.js";
import { normalizeAddress } from "./normalizers.js";

export const accountApi = {
  getProfile() {
    return httpClient.get("/account/profile");
  },

  updateProfile(payload) {
    return httpClient.put("/account/profile", payload);
  },

  async getAddresses() {
    const result = await httpClient.get("/account/addresses");
    return (result ?? []).map(normalizeAddress).filter(Boolean);
  },

  async createAddress(payload) {
    return normalizeAddress(await httpClient.post("/account/addresses", payload));
  },

  async updateAddress(id, payload) {
    return normalizeAddress(await httpClient.put(`/account/addresses/${id}`, payload));
  },

  deleteAddress(id) {
    return httpClient.delete(`/account/addresses/${id}`);
  },

  async setDefaultAddress(id) {
    return normalizeAddress(await httpClient.put(`/account/addresses/${id}/default`));
  },

  deleteAccount() {
    return httpClient.delete("/account");
  },
};
