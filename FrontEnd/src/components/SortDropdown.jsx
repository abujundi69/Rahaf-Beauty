import { useLanguage } from "../context/LanguageContext.jsx";

export const sortOptions = [
  { value: "newest", labelKey: "newest" },
  { value: "price-asc", labelKey: "priceAsc" },
  { value: "price-desc", labelKey: "priceDesc" },
  { value: "rating", labelKey: "highestRated" },
];

export default function SortDropdown({ value, onChange }) {
  const { t } = useLanguage();

  return (
    <label className="flex min-w-0 items-center gap-3 text-sm font-semibold text-ink">
      <span className="hidden sm:inline">{t("sort")}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 max-w-[12rem] rounded-2xl border border-transparent bg-white px-4 text-sm text-ink shadow-sm outline-none transition focus:border-terracotta/40 focus:ring-4 focus:ring-shell/25 sm:max-w-none"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
}
