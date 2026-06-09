import { useCatalog } from "./CatalogContext.jsx";

export const ProductsProvider = ({ children }) => children;

export function useProducts() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
  } = useCatalog();

  return { products, addProduct, updateProduct, deleteProduct, getProductById };
}
