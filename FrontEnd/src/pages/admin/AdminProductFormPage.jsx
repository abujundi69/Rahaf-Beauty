import { Link, useParams } from "react-router-dom";
import ProductForm from "../../components/admin/ProductForm.jsx";
import Button from "../../components/Button.jsx";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function AdminProductFormPage({ mode = "add" }) {
  const { id } = useParams();
  const { getProductById } = useCatalog();
  const { t } = useLanguage();
  const product = mode === "edit" ? getProductById(id) : null;

  if (mode === "edit" && !product) {
    return (
      <section className="beauty-shell p-8 text-center">
        <h2 className="font-display text-3xl font-bold text-ink">{t("productNotFound")}</h2>
        <Button as={Link} to="/admin/products" className="mt-6">
          {t("manageProducts")}
        </Button>
      </section>
    );
  }

  return <ProductForm product={product} mode={mode} />;
}
