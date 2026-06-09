import ProductCard from "./ProductCard.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function ProductGrid({ products, emptyTitle = "", emptyDescription = "" }) {
  const { t } = useLanguage();

  if (products.length === 0) {
    const description =
      emptyDescription === null ? "" : emptyDescription || t("emptyProducts");

    return (
      <div className="rounded-2xl border border-petal/70 bg-white p-10 text-center shadow-sm">
        <h3 className="text-2xl font-extrabold text-ink">
          {emptyTitle || t("noProducts")}
        </h3>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:gap-5 xl:grid-cols-4 2xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
