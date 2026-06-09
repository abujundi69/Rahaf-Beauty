import { SlidersHorizontal, X } from "lucide-react";
import Button from "./Button.jsx";
import {
  getBrandName,
  getBrands,
  getCategoryOptions,
} from "../utils/catalog.js";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

function toggleArrayValue(values, value) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function CheckboxGroup({ title, options, value, onChange }) {
  return (
    <fieldset className="border-b border-petal pb-6">
      <legend className="mb-4 text-sm font-extrabold text-ink">{title}</legend>
      <div className="space-y-3">
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          return (
            <label
              key={optionValue}
              className="flex items-center gap-3 text-sm font-medium text-muted"
            >
              <input
                type="checkbox"
                checked={value.includes(optionValue)}
                onChange={() => onChange(toggleArrayValue(value, optionValue))}
                className="h-4 w-4 rounded border-shell text-terracotta focus:ring-terracotta"
              />
              <span>{label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function FilterSidebar({
  filters,
  setFilters,
  showCategoryFilter = true,
  brandOptions,
  onClose,
}) {
  const { storefrontProducts: products, storefrontCategories: categories } = useCatalog();
  const { language, t } = useLanguage();
  const brands = (brandOptions ?? getBrands(products)).map((brand) => ({
    value: brand,
    label: getBrandName(brand),
  }));
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const clear = () =>
    setFilters((current) => ({
      ...current,
      categories: [],
      brands: [],
      minPrice: "",
      maxPrice: "",
      rating: "",
    }));

  return (
    <aside className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-petal text-terracotta">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-extrabold text-ink">{t("filters")}</h2>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-petal text-muted"
            aria-label={t("filters")}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="space-y-6">
        {showCategoryFilter ? (
          <CheckboxGroup
            title={t("category")}
            options={getCategoryOptions(categories, language)}
            value={filters.categories}
            onChange={(value) => update("categories", value)}
          />
        ) : null}

        <CheckboxGroup
          title={t("brand")}
          options={brands}
          value={filters.brands}
          onChange={(value) => update("brands", value)}
        />

        <fieldset className="border-b border-petal pb-6">
          <legend className="mb-4 text-sm font-extrabold text-ink">
            {t("priceRange")}
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted">
              من
              <input
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={(event) => update("minPrice", event.target.value)}
                className="mt-2 h-10 w-full rounded-2xl bg-ivory px-3 text-sm text-ink outline-none focus:ring-4 focus:ring-shell/25"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted">
              إلى
              <input
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(event) => update("maxPrice", event.target.value)}
                className="mt-2 h-10 w-full rounded-2xl bg-ivory px-3 text-sm text-ink outline-none focus:ring-4 focus:ring-shell/25"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="border-b border-petal pb-6">
          <legend className="mb-4 text-sm font-extrabold text-ink">{t("rating")}</legend>
          <div className="space-y-3">
            {[4.8, 4.5, 4.0].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-3 text-sm font-medium text-muted"
              >
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === String(rating)}
                  onChange={() => update("rating", String(rating))}
                  className="h-4 w-4 border-shell text-terracotta focus:ring-terracotta"
                />
                {rating}+
              </label>
            ))}
            <button
              type="button"
              onClick={() => update("rating", "")}
              className="text-sm font-semibold text-terracotta"
            >
              {t("anyRating")}
            </button>
          </div>
        </fieldset>

        <Button type="button" variant="outline" className="w-full" onClick={clear}>
          {t("clearFilters")}
        </Button>
      </div>
    </aside>
  );
}
