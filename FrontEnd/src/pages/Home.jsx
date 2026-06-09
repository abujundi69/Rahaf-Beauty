import { useEffect, useMemo, useState } from "react";
import { toArabicError } from "../api/httpClient.js";
import { productsApi } from "../api/productsApi.js";
import CategoryScroller from "../components/CategoryScroller.jsx";
import Hero from "../components/Hero.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { getProductName } from "../utils/catalog.js";

export default function Home() {
  const { storefrontProducts: products, loading, error } = useCatalog();
  const [mostOrderedProducts, setMostOrderedProducts] = useState([]);
  const [mostOrderedLoading, setMostOrderedLoading] = useState(true);
  const [mostOrderedError, setMostOrderedError] = useState("");

  useEffect(() => {
    let active = true;
    setMostOrderedLoading(true);
    setMostOrderedError("");

    productsApi
      .mostOrdered(4)
      .then((result) => {
        if (active) {
          setMostOrderedProducts(result);
        }
      })
      .catch((requestError) => {
        if (active) {
          setMostOrderedProducts([]);
          setMostOrderedError(toArabicError(requestError));
        }
      })
      .finally(() => {
        if (active) {
          setMostOrderedLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const alphabeticalProducts = useMemo(
    () =>
      [...products].sort((first, second) =>
        getProductName(first, "ar").localeCompare(getProductName(second, "ar"), "ar"),
      ),
    [products],
  );
  const remainingProducts = useMemo(() => {
    const featuredIds = new Set(mostOrderedProducts.map((product) => product.id));
    return alphabeticalProducts.filter((product) => !featuredIds.has(product.id));
  }, [alphabeticalProducts, mostOrderedProducts]);
  const allSectionProducts =
    remainingProducts.length > 0 ? remainingProducts : alphabeticalProducts;

  return (
    <>
      <Hero />
      <CategoryScroller />

      <section className="container-page py-10">
        <SectionHeader title="الأكثر طلباً" />
        {mostOrderedLoading ? (
          <div className="beauty-shell p-10 text-center text-sm font-bold text-muted">
            جاري التحميل...
          </div>
        ) : mostOrderedError ? (
          <div className="rounded-2xl border border-sale/20 bg-sale/10 p-6 text-center text-sm font-bold text-sale">
            {mostOrderedError}
          </div>
        ) : mostOrderedProducts.length === 0 ? (
          <div className="beauty-shell p-8 text-center text-sm font-bold text-muted">
            لا توجد منتجات مطلوبة بعد.
          </div>
        ) : (
          <ProductGrid products={mostOrderedProducts} emptyDescription={null} variant="home" />
        )}
      </section>

      <section className="container-page pb-12 pt-2 md:pb-16">
        <SectionHeader title={remainingProducts.length > 0 ? "باقي المنتجات" : "كل المنتجات"} />
        {loading ? (
          <div className="beauty-shell p-10 text-center text-sm font-bold text-muted">
            جاري التحميل...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-sale/20 bg-sale/10 p-6 text-center text-sm font-bold text-sale">
            {error}
          </div>
        ) : (
          <ProductGrid products={allSectionProducts} emptyDescription={null} variant="home" />
        )}
      </section>
    </>
  );
}
