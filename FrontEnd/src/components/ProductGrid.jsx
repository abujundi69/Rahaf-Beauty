import ProductCard from "./ProductCard.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { cn } from "../utils/cn.js";

export default function ProductGrid({
  products,
  emptyTitle = "",
  emptyDescription = "",
  variant = "store",
}) {
  const { t } = useLanguage();

  if (products.length === 0) {
    const description =
      emptyDescription === null ? "" : emptyDescription || t("emptyProducts");

    return (
      <div className="beauty-shell p-10 text-center">
        <h3 className="text-2xl font-extrabold text-ink">
          {emptyTitle || t("noProducts")}
        </h3>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
    );
  }

  const isHome = variant === "home";

  return (
    <div
      className={cn(
        "grid items-stretch",
        isHome
          ? "grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1 gap-5 min-[385px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 xl:gap-6",
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} variant={variant} />
      ))}
    </div>
  );
}
