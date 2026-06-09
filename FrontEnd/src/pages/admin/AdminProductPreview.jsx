import { Link, useParams } from "react-router-dom";
import Button from "../../components/Button.jsx";
import ProductDetails from "../../components/ProductDetails.jsx";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { getRelatedProducts } from "../../utils/catalog.js";

export default function AdminProductPreview() {
  const { id } = useParams();
  const { products, getProductById } = useCatalog();
  const { t } = useLanguage();
  const product = getProductById(id);

  if (!product) {
    return (
      <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <h2 className="font-display text-3xl font-bold text-ink">{t("productNotFound")}</h2>
        <Button as={Link} to="/admin/products" className="mt-6">
          {t("manageProducts")}
        </Button>
      </section>
    );
  }

  return (
    <div className="rounded-2xl bg-white/40 p-1">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
            {t("productPreview")}
          </p>
        </div>
        <Button as={Link} to={`/admin/products/${product.id}/edit`} variant="outline">
          {t("editProduct")}
        </Button>
      </div>
      <ProductDetails product={product} relatedProducts={getRelatedProducts(products, product)} />
    </div>
  );
}
