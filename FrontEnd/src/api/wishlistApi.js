import { httpClient } from "./httpClient.js";
import { normalizeWishlist } from "./normalizers.js";

export const wishlistApi = {
  async get() {
    return normalizeWishlist(await httpClient.get("/wishlist"));
  },

  async addItem(productId) {
    return normalizeWishlist(await httpClient.post("/wishlist/items", { productId }));
  },

  deleteItem(id) {
    return httpClient.delete(`/wishlist/items/${id}`);
  },
};
