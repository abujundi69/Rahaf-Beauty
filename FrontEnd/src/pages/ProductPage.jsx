import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { productsApi } from "../api/productsApi.js";
import { toArabicError } from "../api/httpClient.js";
import Button from "../components/Button.jsx";
import ProductDetails from "../components/ProductDetails.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import {
  getProductBySlug,
  getRelatedProducts,
} from "../utils/catalog.js";

export default function ProductPage() {
  const { slug } = useParams();
  const { products } = useCatalog();
  const { t } = useLanguage();
  const [product, setProduct] = useState(() => getProductBySlug(products, slug));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProduct = useCallback(() => productsApi.getBySlug(slug), [slug]);
  const reloadProduct = useCallback(async () => {
    const result = await fetchProduct();
    setProduct(result);
    return result;
  }, [fetchProduct]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetchProduct()
      .then((result) => {
        if (active) setProduct(result);
      })
      .catch((requestError) => {
        if (!active) return;
        setProduct(getProductBySlug(products, slug));
        setError(toArabicError(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchProduct, products, slug]);

  const relatedProducts = useMemo(
    () => getRelatedProducts(products, product),
    [product, products],
  );

  if (loading && !product) {
    return (
      <section className="container-page py-16 text-center">
        <h1 className="font-display text-4xl font-bold text-ink">{t("loading")}</h1>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="container-page py-16 text-center">
        <h1 className="font-display text-4xl font-bold text-ink">{t("productNotFound")}</h1>
        {error ? <p className="mt-3 text-sm font-bold text-muted">{error}</p> : null}
        <Button as={Link} to="/shop" className="mt-6">
          {t("shop")}
        </Button>
      </section>
    );
  }

  return (
    <ProductDetails
      product={product}
      relatedProducts={relatedProducts}
      onProductReload={reloadProduct}
    />
  );
}
