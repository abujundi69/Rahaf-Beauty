import { useStore } from "../utils/store.jsx";

export const WishlistProvider = ({ children }) => children;

export function useWishlist() {
  return useStore();
}
