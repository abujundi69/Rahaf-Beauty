import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { adminApi } from "../api/adminApi.js";
import { brandsApi } from "../api/brandsApi.js";
import { categoriesApi } from "../api/categoriesApi.js";
import { toArabicError } from "../api/httpClient.js";
import { productsApi } from "../api/productsApi.js";
import { useAuth } from "./AuthContext.jsx";

const CatalogContext = createContext(null);

function categoryPayload(category) {
  return {
    name: category.nameAr || category.name || category.nameEn || "",
    slug: category.slug || null,
    description:
      category.introAr ||
      category.subtitleAr ||
      category.description ||
      category.subtitle ||
      null,
    imageUrl: category.imageUrl || category.image || null,
    imageFile: category.imageFile ?? null,
    isActive: category.status !== "Draft",
  };
}

async function fetchAllPaged(fetchPage, params = {}) {
  const pageSize = 100;
  let page = 1;
  let totalPages = 1;
  const allItems = [];

  do {
    const result = await fetchPage({ ...params, page, pageSize });
    allItems.push(...(result.items ?? []));
    totalPages = Number(result.totalPages) || page;
    page += 1;
  } while (page <= totalPages);

  const byId = new Map();
  allItems.forEach((item) => {
    if (item?.id && !byId.has(item.id)) {
      byId.set(item.id, item);
    }
  });

  return [...byId.values()];
}

export function CatalogProvider({ children }) {
  const { isAdmin, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [productsResult, categoriesResult, brandsResult] = await Promise.all([
        isAdmin
          ? fetchAllPaged(productsApi.adminList, { sort: "name" })
          : fetchAllPaged(productsApi.list, { sort: "name" }),
        isAdmin ? categoriesApi.adminList() : categoriesApi.list(),
        isAdmin ? brandsApi.adminList() : brandsApi.list(),
      ]);
      setProducts(productsResult);
      setCategories(categoriesResult);
      setBrands(brandsResult);
    } catch (requestError) {
      setProducts([]);
      setCategories([]);
      setBrands([]);
      setError(toArabicError(requestError));
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog, isAuthenticated]);

  const addProduct = useCallback(
    async (payload) => {
      const created = await adminApi.createProduct(payload);
      await loadCatalog();
      return created;
    },
    [loadCatalog],
  );

  const updateProduct = useCallback(
    async (productId, payload) => {
      const updated = await adminApi.updateProduct(productId, payload);
      await loadCatalog();
      return updated;
    },
    [loadCatalog],
  );

  const deleteProduct = useCallback(
    async (productId) => {
      await adminApi.deleteProduct(productId);
      await loadCatalog();
    },
    [loadCatalog],
  );

  const addCategory = useCallback(
    async (category) => {
      const created = await categoriesApi.create(categoryPayload(category));
      await loadCatalog();
      return created;
    },
    [loadCatalog],
  );

  const updateCategory = useCallback(
    async (categoryId, updates) => {
      const updated = await categoriesApi.update(categoryId, categoryPayload(updates));
      await loadCatalog();
      return updated;
    },
    [loadCatalog],
  );

  const deleteCategory = useCallback(
    async (categoryId) => {
      await categoriesApi.delete(categoryId);
      await loadCatalog();
    },
    [loadCatalog],
  );

  const value = useMemo(() => {
    const categoryEntries = categories.flatMap((category) => [
      [category.id, category],
      [category.slug, category],
    ]);
    const categoryMap = Object.fromEntries(categoryEntries);
    const brandMap = Object.fromEntries(
      brands.flatMap((brand) => [
        [brand.id, brand],
        [brand.name, brand],
        [brand.slug, brand],
      ]),
    );

    return {
      products,
      categories,
      brands,
      brandMap,
      loading,
      error,
      storefrontProducts: products.filter((product) => product.status !== "Draft"),
      storefrontCategories: categories.filter((category) => category.status !== "Draft"),
      categoryMap,
      refreshCatalog: loadCatalog,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      getCategory: (id) => categoryMap[id] ?? null,
      getProductById: (id) => products.find((product) => product.id === id) ?? null,
      getProductBySlug: (slug) => products.find((product) => product.slug === slug) ?? null,
      getBrandsForCategory: (categoryIdOrSlug) =>
        [
          ...new Set(
            products
              .filter(
                (product) =>
                  product.category === categoryIdOrSlug ||
                  product.categoryId === categoryIdOrSlug ||
                  product.categorySlug === categoryIdOrSlug,
              )
              .map((product) => product.brand)
              .filter(Boolean),
          ),
        ]
          .map((brandName) => brandMap[brandName] ?? { id: brandName, name: brandName, slug: brandName })
          .sort((a, b) => String(a.name).localeCompare(String(b.name))),
    };
  }, [
    addCategory,
    addProduct,
    brands,
    categories,
    deleteCategory,
    deleteProduct,
    error,
    loadCatalog,
    loading,
    products,
    updateCategory,
    updateProduct,
  ]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used within CatalogProvider");
  }
  return context;
}
