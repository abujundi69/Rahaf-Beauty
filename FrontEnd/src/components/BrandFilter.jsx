import { X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { cn } from "../utils/cn.js";
import { getBrandName } from "../utils/catalog.js";

export default function BrandFilter({ brands, selectedBrands, onToggle, onClear }) {
  const { t } = useLanguage();

  if (brands.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {brands.map((brand) => {
        const active = selectedBrands.includes(brand);
        return (
          <button
            key={brand}
            type="button"
            onClick={() => onToggle(brand)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              active
                ? "bg-ink text-white shadow-card"
                : "bg-white text-muted shadow-sm hover:text-ink",
            )}
          >
            {getBrandName(brand)}
          </button>
        );
      })}
      {selectedBrands.length > 0 ? (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-terracotta transition hover:bg-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          {t("clear")}
        </button>
      ) : null}
    </div>
  );
}
