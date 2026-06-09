import { useCatalog } from "./CatalogContext.jsx";

export const CategoriesProvider = ({ children }) => children;

export function useCategories() {
  const {
    categories,
    categoryMap,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    getBrandsForCategory,
  } = useCatalog();

  return {
    categories,
    categoryMap,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    getBrandsForCategory,
  };
}
