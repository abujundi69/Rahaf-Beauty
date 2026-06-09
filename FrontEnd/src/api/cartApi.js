import { httpClient } from "./httpClient.js";
import { normalizeCart } from "./normalizers.js";

export const cartApi = {
  async get() {
    return normalizeCart(await httpClient.get("/cart"));
  },

  async addItem(payload) {
    return normalizeCart(await httpClient.post("/cart/items", payload));
  },

  async updateItem(id, quantity) {
    return normalizeCart(await httpClient.put(`/cart/items/${id}`, { quantity }));
  },

  deleteItem(id) {
    return httpClient.delete(`/cart/items/${id}`);
  },

  clear() {
    return httpClient.delete("/cart");
  },
};
