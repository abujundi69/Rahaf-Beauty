import { formatCurrency } from "./format.js";
import { calculateProductPricing } from "./pricing.js";

export const formatPrice = (value) => formatCurrency(value);

export const getBrandName = (brand) => {
  if (!brand) return "";
  if (typeof brand === "string") return brand;
  return brand.nameAr || brand.name || brand.nameEn || "";
};

export const getProductName = (product, language = "en") =>
  language === "ar"
    ? product?.nameAr || product?.nameEn || product?.name || ""
    : product?.nameEn || product?.name || product?.nameAr || "";

export const getProductDescription = (product, language = "en") =>
  language === "ar"
    ? product?.descriptionAr || product?.descriptionEn || product?.description || ""
    : product?.descriptionEn || product?.description || product?.descriptionAr || "";

export const getCategoryName = (category, language = "en") =>
  language === "ar"
    ? category?.nameAr || category?.nameEn || category?.name || ""
    : category?.nameEn || category?.name || category?.nameAr || "";

export const getCategorySubtitle = (category, language = "en") =>
  language === "ar"
    ? category?.subtitleAr || category?.subtitleEn || category?.subtitle || ""
    : category?.subtitleEn || category?.subtitle || category?.subtitleAr || "";

export const getCategoryIntro = (category, language = "en") =>
  language === "ar"
    ? category?.introAr || category?.introEn || category?.intro || ""
    : category?.introEn || category?.intro || category?.introAr || "";

export const toProductSlug = (product) => {
  if (product?.slug) return product.slug;
  const name = product?.nameEn || product?.name || product?.nameAr || "product";
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug || "product"}-${product?.id ?? ""}`;
};

export const getProductBySlug = (products, slug) => {
  const id = slug?.match(/[0-9a-fA-F-]{36}$/)?.[0];
  return (
    products.find((product) => product.slug === slug) ??
    products.find((product) => product.id === id || product.id === slug) ??
    null
  );
};

export const getCategoryPath = (category) => {
  const key = typeof category === "object" ? category.slug || category.id : category;
  return `/category/${key}`;
};

export const uniqueValues = (items, getter) =>
  [...new Set(items.flatMap((item) => getter(item)).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b)),
  );

export const getBrands = (products) =>
  uniqueValues(products, (product) => [product.brand]);

const getProductCategoryKeys = (product) =>
  [
    product.category,
    product.categoryId,
    product.categorySlug,
    product.categoryName,
    product.categoryNameAr,
  ].filter(Boolean);

export const getBrandsForCategory = (products, categoryId) =>
  uniqueValues(
    products.filter((product) => getProductCategoryKeys(product).includes(categoryId)),
    (product) => [product.brand],
  );

export const getRelatedProducts = (products, product, limit = 4) => {
  if (!product) return [];

  const productCategories = getProductCategoryKeys(product);
  const sameCategory = products.filter(
    (candidate) =>
      candidate.id !== product.id &&
      getProductCategoryKeys(candidate).some((key) => productCategories.includes(key)),
  );

  const fallback = products.filter((candidate) => candidate.id !== product.id);
  return [...sameCategory, ...fallback]
    .filter(
      (candidate, index, list) =>
        list.findIndex((item) => item.id === candidate.id) === index,
    )
    .slice(0, limit);
};

export const filterProducts = (items, filters = {}, categoryMap = {}, settings) => {
  const {
    query = "",
    categories: activeCategories = [],
    brands = [],
    minPrice = "",
    maxPrice = "",
  } = filters;

  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((product) => {
    const categoryKeys = getProductCategoryKeys(product);
    const category =
      categoryKeys.map((key) => categoryMap[key]).find(Boolean) ??
      categoryMap[product.categoryId] ??
      null;

    const matchesQuery =
      !normalizedQuery ||
      [
        product.name,
        product.nameEn,
        product.nameAr,
        product.brand,
        category?.name,
        category?.nameEn,
        category?.nameAr,
        product.description,
        product.descriptionEn,
        product.descriptionAr,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));

    const matchesCategory =
      activeCategories.length === 0 ||
      categoryKeys.some((key) => activeCategories.includes(key));

    const matchesBrand = brands.length === 0 || brands.includes(product.brand);

    const min = Number(minPrice);
    const max = Number(maxPrice);
    const effectivePrice = calculateProductPricing(product, settings).finalPrice;
    const matchesMin = minPrice === "" || effectivePrice >= min;
    const matchesMax = maxPrice === "" || effectivePrice <= max;

    return (
      matchesQuery &&
      matchesCategory &&
      matchesBrand &&
      matchesMin &&
      matchesMax
    );
  });
};

export const sortProducts = (items, sortBy = "newest", settings) => {
  const sorted = [...items];

  if (sortBy === "price-asc") {
    return sorted.sort(
      (a, b) =>
        calculateProductPricing(a, settings).finalPrice -
        calculateProductPricing(b, settings).finalPrice,
    );
  }

  if (sortBy === "price-desc") {
    return sorted.sort(
      (a, b) =>
        calculateProductPricing(b, settings).finalPrice -
        calculateProductPricing(a, settings).finalPrice,
    );
  }

  if (sortBy === "rating") {
    return sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  }

  return sorted.sort((a, b) => {
    if (a.isNew !== b.isNew) return Number(b.isNew) - Number(a.isNew);
    return String(b.createdAt ?? b.id).localeCompare(String(a.createdAt ?? a.id));
  });
};

export const getDefaultFilters = () => ({
  query: "",
  categories: [],
  brands: [],
  minPrice: "",
  maxPrice: "",
});

export const getCategoryOptions = (categories, language) =>
  categories.map((category) => ({
    label: getCategoryName(category, language),
    value: category.id,
  }));

export const translateAvailability = (value, t) => {
  const map = {
    "In Stock": "inStock",
    "Low Stock": "lowStock",
    "Out of Stock": "outOfStock",
  };
  return t(map[value] ?? value);
};
