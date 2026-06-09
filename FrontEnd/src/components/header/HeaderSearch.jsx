import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { productsApi } from "../../api/productsApi.js";
import ProductVisual from "../ProductVisual.jsx";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import {
  formatPrice,
  getProductName,
  toProductSlug,
} from "../../utils/catalog.js";
import { cn } from "../../utils/cn.js";
import { calculateProductPricing } from "../../utils/pricing.js";
import CategorySearchDropdown, { ALL_CATEGORIES } from "./CategorySearchDropdown.jsx";

function buildSearchPath(query, categoryId) {
  const params = new URLSearchParams();
  const trimmed = query.trim();

  if (trimmed) params.set("q", trimmed);
  if (categoryId && categoryId !== ALL_CATEGORIES) params.set("category", categoryId);

  const search = params.toString();
  return search ? `/search?${search}` : "/search";
}

export default function HeaderSearch({
  className = "",
  query: controlledQuery,
  categoryId: controlledCategoryId,
  onQueryChange,
  onCategoryChange,
  onSubmitSearch,
  onSearchComplete,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const {
    storefrontCategories: categories,
  } = useCatalog();
  const { language, t } = useLanguage();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const searchKey = location.search;
  const [internalQuery, setInternalQuery] = useState(() => searchParams.get("q") ?? "");
  const [internalCategoryId, setInternalCategoryId] = useState(
    () => searchParams.get("category") ?? ALL_CATEGORIES,
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownProducts, setDropdownProducts] = useState([]);

  const query = controlledQuery ?? internalQuery;
  const categoryId = controlledCategoryId ?? internalCategoryId;
  const trimmedQuery = query.trim();

  useEffect(() => {
    if (controlledQuery !== undefined || location.pathname !== "/search") return;
    const currentParams = new URLSearchParams(searchKey);
    setInternalQuery(currentParams.get("q") ?? "");
  }, [controlledQuery, location.pathname, searchKey]);

  useEffect(() => {
    if (controlledCategoryId !== undefined || location.pathname !== "/search") return;
    const currentParams = new URLSearchParams(searchKey);
    setInternalCategoryId(currentParams.get("category") ?? ALL_CATEGORIES);
  }, [controlledCategoryId, location.pathname, searchKey]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!searchRef.current?.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!trimmedQuery) {
      setDropdownProducts([]);
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      productsApi
        .search({
          q: trimmedQuery,
          categoryId: categoryId === ALL_CATEGORIES ? undefined : categoryId,
          page: 1,
          pageSize: 7,
        })
        .then((result) => {
          if (active) setDropdownProducts(result.items ?? []);
        })
        .catch(() => {
          if (active) setDropdownProducts([]);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [categoryId, trimmedQuery]);

  const updateQuery = (nextQuery) => {
    if (onQueryChange) {
      onQueryChange(nextQuery);
    } else {
      setInternalQuery(nextQuery);
    }

    setDropdownOpen(Boolean(nextQuery.trim()));
  };

  const updateCategory = (nextCategoryId) => {
    if (onCategoryChange) {
      onCategoryChange(nextCategoryId);
    } else {
      setInternalCategoryId(nextCategoryId);
    }

    setDropdownOpen(Boolean(trimmedQuery));
  };

  const submit = (event) => {
    event.preventDefault();
    const payload = { query: trimmedQuery, categoryId };

    setDropdownOpen(false);

    if (onSubmitSearch) {
      onSubmitSearch(payload);
    } else {
      navigate(buildSearchPath(payload.query, categoryId));
    }

    onSearchComplete?.();
  };

  const openProduct = (product) => {
    setDropdownOpen(false);
    navigate(`/product/${toProductSlug(product)}`);
    onSearchComplete?.();
  };

  const shouldShowDropdown = dropdownOpen && trimmedQuery.length > 0;

  return (
    <form
      ref={searchRef}
      onSubmit={submit}
      className={cn(
        "relative rounded-[1.35rem] border border-petal/70 bg-white/90 p-1.5 shadow-[0_14px_34px_rgba(190,24,93,0.1)] transition focus-within:border-clay/50 focus-within:ring-4 focus-within:ring-shell/70 sm:rounded-full",
        className,
      )}
      role="search"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
        <CategorySearchDropdown
          categories={categories}
          value={categoryId}
          onChange={updateCategory}
          language={language}
          t={t}
          className="h-11 rounded-2xl border border-petal/80 bg-shell/70 sm:h-12 sm:w-52 sm:rounded-e-none sm:rounded-s-full sm:border-0 sm:border-e sm:bg-shell/60"
        />
        <div className="flex min-w-0 flex-1 items-center rounded-2xl bg-white sm:h-12 sm:rounded-none">
          <input
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            onFocus={() => setDropdownOpen(Boolean(trimmedQuery))}
            placeholder={t("searchForProducts")}
            className="h-11 min-w-0 flex-1 border-0 bg-transparent px-4 text-sm font-semibold text-ink outline-none placeholder:text-muted/75 focus:ring-0 sm:h-full"
          />
          <button
            type="submit"
            className="me-1 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-r from-clay to-terracotta text-white shadow-[0_10px_24px_rgba(219,39,119,0.24)] transition hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            aria-label={t("search")}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {shouldShowDropdown ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-dropdown max-h-[min(70vh,28rem)] overflow-y-auto rounded-[1.35rem] border border-petal/80 bg-white/95 p-2 text-start shadow-soft backdrop-blur">
          {dropdownProducts.length > 0 ? (
            <div className="space-y-1">
              {dropdownProducts.map((product) => {
                const pricing = calculateProductPricing(product);
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => openProduct(product)}
                    className="flex w-full min-w-0 items-center gap-3 rounded-2xl p-2 text-start transition hover:bg-shell/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
                  >
                    <ProductVisual
                      product={product}
                      className="h-14 w-14 shrink-0 rounded-xl"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-sm font-extrabold leading-5 text-ink">
                        {getProductName(product, language)}
                      </span>
                      <span className="mt-1 block text-xs font-bold text-muted">
                        {formatPrice(pricing.finalPrice, language)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-shell px-4 py-5 text-center text-sm font-bold text-muted">
              {t("noMatchingResults")}
            </div>
          )}
        </div>
      ) : null}
    </form>
  );
}
