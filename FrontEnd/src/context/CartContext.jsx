import { useStore } from "../utils/store.jsx";

export const CartProvider = ({ children }) => children;

export function useCart() {
  return useStore();
}
