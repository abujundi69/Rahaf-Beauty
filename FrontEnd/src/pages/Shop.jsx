import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import FilterSidebar from "../components/FilterSidebar.jsx";
import MobileFilters from "../components/MobileFilters.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import SearchBar from "../components/SearchBar.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import SortDropdown from "../components/SortDropdown.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useStoreSettings } from "../context/StoreSettingsContext.jsx";
import {
  filterProducts,
  getDefaultFilters,
  sortProducts,
} from "../utils/catalog.js";
import { formatNumber } from "../utils/format.js";

export default function Shop() {
  const { storefrontProducts: products, categoryMap } = useCatalog();
  const { t } = useLanguage();
  const { settings } = useStoreSettings();
  const [filters, setFilters] = useState(getDefaultFilters);
  const [sortBy, setSortBy] = useState("newest");

  const visibleProducts = useMemo(
    () => sortProducts(filterProducts(products, filters, categoryMap, settings), sortBy, settings),
    [products, filters, sortBy, categoryMap, settings],
  );

  return (
    <section className="container-page py-10 md:py-14">
      <SectionHeader
        eyebrow="متجر RAHAF BEAUTY"
        title="رف الجمال"
        description="تصفحي العناية والمكياج والجسم والعطور وطقوس الجمال اليومية."
      />

      <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <MobileFilters filters={filters} setFilters={setFilters} />
          <SearchBar
            value={filters.query}
            onChange={(query) => setFilters((current) => ({ ...current, query }))}
            onSubmit={(event) => event.preventDefault()}
            placeholder={t("searchProducts")}
            className="flex-1"
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-muted">
            <SlidersHorizontal className="h-4 w-4 text-terracotta" aria-hidden="true" />
            {formatNumber(visibleProducts.length)} {t("items")}
          </span>
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} setFilters={setFilters} />
        </div>
        <ProductGrid products={visibleProducts} />
      </div>
    </section>
  );
}
