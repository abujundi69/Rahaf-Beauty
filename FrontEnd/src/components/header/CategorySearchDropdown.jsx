import { ChevronDown } from "lucide-react";
import { getCategoryName } from "../../utils/catalog.js";
import { cn } from "../../utils/cn.js";

export const ALL_CATEGORIES = "all";

export function getSearchCategoryLabel(category, language, t) {
  if (!category) return t("allCategories");
  return getCategoryName(category, language);
}

export default function CategorySearchDropdown({
  categories,
  value,
  onChange,
  language,
  t,
  className = "",
}) {
  return (
    <label className={cn("relative block shrink-0", className)}>
      <span className="sr-only">{t("allCategories")}</span>
      <select
        value={value || ALL_CATEGORIES}
        onChange={(event) => onChange(event.target.value)}
        className="h-full w-full appearance-none !border-0 !bg-transparent py-3 pe-9 ps-4 text-sm font-extrabold text-ink !shadow-none outline-none"
        aria-label={t("allCategories")}
      >
        <option value={ALL_CATEGORIES}>{t("allCategories")}</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {getSearchCategoryLabel(category, language, t)}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-terracotta"
        aria-hidden="true"
      />
    </label>
  );
}
