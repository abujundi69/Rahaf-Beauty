import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BrandFilterChips from "../components/BrandFilterChips.jsx";
import Button from "../components/Button.jsx";
import CategoryHeader from "../components/CategoryHeader.jsx";
import FilterSidebar from "../components/FilterSidebar.jsx";
import MobileFilters from "../components/MobileFilters.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import SearchBar from "../components/SearchBar.jsx";
import SortDropdown from "../components/SortDropdown.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useStoreSettings } from "../context/StoreSettingsContext.jsx";
import {
  filterProducts,
  getCategorySubtitle,
  getDefaultFilters,
  sortProducts,
} from "../utils/catalog.js";
import { formatNumber } from "../utils/format.js";

function toggleValue(values, value) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export default function Category() {
  const { slug } = useParams();
  const { storefrontProducts: products, categoryMap, getBrandsForCategory } = useCatalog();
  const { language, t } = useLanguage();
  const { settings } = useStoreSettings();
  const category = categoryMap[slug];
  const [filters, setFilters] = useState(getDefaultFilters);
  const [sortBy, setSortBy] = useState("newest");

  const categoryProducts = useMemo(
    () => {
      const categoryKeys = [slug, category?.id, category?.slug].filter(Boolean);
      return products.filter((product) =>
        [product.category, product.categoryId, product.categorySlug]
          .filter(Boolean)
          .some((key) => categoryKeys.includes(key)),
      );
    },
    [category, products, slug],
  );
  const brandOptions = useMemo(() => getBrandsForCategory(slug), [getBrandsForCategory, slug]);

  const visibleProducts = useMemo(
    () => sortProducts(filterProducts(categoryProducts, filters, categoryMap, settings), sortBy, settings),
    [categoryProducts, filters, sortBy, categoryMap, settings],
  );

  if (!category) {
    return (
      <section className="container-page py-16 text-center">
        <h1 className="font-display text-4xl font-bold text-ink">{t("categoryNotFound")}</h1>
        <Button as={Link} to="/shop" className="mt-6">
          {t("shop")}
        </Button>
      </section>
    );
  }

  return (
    <section className="container-page py-10 md:py-14">
      <CategoryHeader category={category} />

      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-ink">
              {t("productCount", { count: formatNumber(visibleProducts.length) })}
            </p>
            <p className="mt-1 text-sm text-muted">
              {getCategorySubtitle(category, language)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <MobileFilters
              filters={filters}
              setFilters={setFilters}
              showCategoryFilter={false}
              brandOptions={brandOptions}
            />
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>
        <SearchBar
          value={filters.query}
          onChange={(query) => setFilters((current) => ({ ...current, query }))}
          onSubmit={(event) => event.preventDefault()}
          placeholder={t("searchProducts")}
          className="mb-4"
        />
        <BrandFilterChips
          brands={brandOptions}
          selectedBrands={filters.brands}
          onToggle={(brand) =>
            setFilters((current) => ({
              ...current,
              brands: toggleValue(current.brands, brand),
            }))
          }
          onClear={() => setFilters((current) => ({ ...current, brands: [] }))}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            showCategoryFilter={false}
            brandOptions={brandOptions}
          />
        </div>
        <ProductGrid products={visibleProducts} />
      </div>
    </section>
  );
}
