import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productsApi } from "../api/productsApi.js";
import { toArabicError } from "../api/httpClient.js";
import {
  ALL_CATEGORIES,
  getSearchCategoryLabel,
} from "../components/header/CategorySearchDropdown.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import SEO from "../components/SEO.jsx";
import SortDropdown from "../components/SortDropdown.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { sortProducts } from "../utils/catalog.js";
import { cn } from "../utils/cn.js";
import { formatNumber } from "../utils/format.js";

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const {
    storefrontCategories: categories,
    categoryMap,
  } = useCatalog();
  const { language, t } = useLanguage();
  const query = params.get("q") ?? "";
  const categoryId = params.get("category") ?? ALL_CATEGORIES;
  const [sortBy, setSortBy] = useState("newest");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const category = categoryId === ALL_CATEGORIES ? null : categoryMap[categoryId];

  const categoryOptions = useMemo(
    () => [
      {
        id: ALL_CATEGORIES,
        label: t("allCategories"),
      },
      ...categories.map((item) => ({
        id: item.id,
        label: getSearchCategoryLabel(item, language, t),
      })),
    ],
    [categories, language, t],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    productsApi
      .search({
        q: query,
        categoryId: categoryId === ALL_CATEGORIES ? undefined : categoryId,
        page: 1,
        pageSize: 100,
      })
      .then((result) => {
        if (active) setProducts(result.items ?? []);
      })
      .catch((requestError) => {
        if (!active) return;
        setProducts([]);
        setError(toArabicError(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [categoryId, query]);

  const visibleProducts = useMemo(
    () => sortProducts(products, sortBy),
    [products, sortBy],
  );

  const updateCategory = (nextCategoryId) => {
    const nextParams = new URLSearchParams(params);
    if (nextCategoryId === ALL_CATEGORIES) {
      nextParams.delete("category");
    } else {
      nextParams.set("category", nextCategoryId);
    }
    setParams(nextParams);
  };

  return (
    <section className="container-page py-10 md:py-14">
      <SEO
        title={query.trim() ? `نتائج البحث عن: ${query.trim()}` : "نتائج البحث"}
        description={query.trim() ? `نتائج البحث عن "${query.trim()}" في متجر RAHAF BEAUTY` : "تسوقي من متجر RAHAF BEAUTY"}
        keywords={query.trim() ? `${query.trim()}, RAHAF BEAUTY, متجر تجميل` : undefined}
      />
      <div className="mb-6 rounded-[1.35rem] border border-petal/70 bg-white/90 p-5 shadow-card md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
              {t("search")}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-ink md:text-4xl">
              نتائج البحث
            </h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-secondary">
              {query.trim()
                ? `نتائج البحث عن: "${query.trim()}"`
                : "كل المنتجات المطابقة"}
            </p>
            {error ? <p className="mt-2 text-sm font-bold text-sale">{error}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-shell px-4 py-2 text-sm font-extrabold text-terracotta ring-1 ring-petal/60">
              {loading ? t("loading") : `${formatNumber(visibleProducts.length)} ${t("items")}`}
              {category ? ` - ${getSearchCategoryLabel(category, language, t)}` : ""}
            </span>
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        <fieldset className="mt-5 border-0 p-0">
          <legend className="sr-only">{t("categories")}</legend>
          <div className="flex max-w-full flex-wrap gap-2 overflow-x-auto pb-1">
            {categoryOptions.map((option) => {
              const selected = categoryId === option.id;
              return (
                <label
                  key={option.id}
                  className={cn(
                    "inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-extrabold transition",
                    selected
                      ? "border-clay bg-gradient-to-r from-clay to-terracotta text-white shadow-sm"
                      : "border-petal bg-blush text-ink hover:border-terracotta/70 hover:bg-white",
                  )}
                >
                  <input
                    type="radio"
                    name="search-category"
                    value={option.id}
                    checked={selected}
                    onChange={() => updateCategory(option.id)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "grid h-3.5 w-3.5 place-items-center rounded-full border",
                      selected ? "border-white bg-white/20" : "border-petal bg-white",
                    )}
                    aria-hidden="true"
                  >
                    {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                  </span>
                  {option.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
      <ProductGrid
        products={visibleProducts}
        emptyTitle={loading ? t("loading") : t("noMatchingResults")}
        emptyDescription={loading ? null : null}
      />
    </section>
  );
}
