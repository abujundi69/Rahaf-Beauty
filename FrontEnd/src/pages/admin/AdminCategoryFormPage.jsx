import { Link, useParams } from "react-router-dom";
import CategoryForm from "../../components/admin/CategoryForm.jsx";
import Button from "../../components/Button.jsx";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function AdminCategoryFormPage({ mode = "add" }) {
  const { id } = useParams();
  const { getCategory } = useCatalog();
  const { t } = useLanguage();
  const category = mode === "edit" ? getCategory(id) : null;

  if (mode === "edit" && !category) {
    return (
      <section className="beauty-shell p-8 text-center">
        <h2 className="font-display text-3xl font-bold text-ink">{t("categoryNotFound")}</h2>
        <Button as={Link} to="/admin/categories" className="mt-6">
          {t("manageCategories")}
        </Button>
      </section>
    );
  }

  return <CategoryForm category={category} mode={mode} />;
}
