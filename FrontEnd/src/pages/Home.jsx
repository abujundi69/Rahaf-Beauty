import { useMemo } from "react";
import CategoryScroller from "../components/CategoryScroller.jsx";
import Hero from "../components/Hero.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { getProductName } from "../utils/catalog.js";

export default function Home() {
  const { storefrontProducts: products, loading, error } = useCatalog();
  const alphabeticalProducts = useMemo(
    () =>
      [...products].sort((first, second) =>
        getProductName(first, "ar").localeCompare(getProductName(second, "ar"), "ar"),
      ),
    [products],
  );

  return (
    <>
      <Hero />
      <CategoryScroller />

      <section className="container-page py-10">
        <SectionHeader title="الأكثر طلباً" />
        {loading ? (
          <div className="rounded-2xl border border-petal/70 bg-white p-10 text-center text-sm font-bold text-muted shadow-sm">
            جاري التحميل...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-sale/20 bg-sale/10 p-6 text-center text-sm font-bold text-sale">
            {error}
          </div>
        ) : (
          <ProductGrid products={alphabeticalProducts} emptyDescription={null} />
        )}
      </section>
    </>
  );
}
