import { Edit3, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../Button.jsx";
import CategoryImage from "../CategoryImage.jsx";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { getCategoryName, getCategorySubtitle } from "../../utils/catalog.js";
import { formatNumber } from "../../utils/format.js";
import { productStatusTone, translateProductStatus } from "../../utils/status.js";

export default function AdminCategoriesTable() {
  const { categories, products, loading, error, deleteCategory } = useCatalog();
  const { language, t } = useLanguage();
  const [pendingDeleteId, setPendingDeleteId] = useState("");

  const remove = async (category) => {
    await deleteCategory(category.id);
    setPendingDeleteId("");
  };

  return (
    <section className="min-w-0 rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
            {t("manageCategories")}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink">
            {t("categories")}
          </h2>
        </div>
        <Button as={Link} to="/admin/categories/new">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("addCategory")}
        </Button>
      </div>

      {error ? (
        <p className="mb-4 rounded-2xl bg-sale/10 px-4 py-3 text-sm font-bold text-sale">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3">
        {loading ? (
          <div className="rounded-2xl bg-ivory p-8 text-center text-sm font-bold text-muted">
            {t("loading")}
          </div>
        ) : null}
        {!loading && categories.length === 0 ? (
          <div className="rounded-2xl bg-ivory p-8 text-center text-sm font-bold text-muted">
            {t("noData")}
          </div>
        ) : null}
        {categories.map((category) => {
          const categoryKeys = [category.id, category.slug].filter(Boolean);
          const count = products.filter((product) =>
            [product.category, product.categoryId, product.categorySlug]
              .filter(Boolean)
              .some((key) => categoryKeys.includes(key)),
          ).length;
          const name = getCategoryName(category, language);
          return (
            <article
              key={category.id}
              className="grid gap-4 rounded-2xl bg-ivory p-4 md:grid-cols-[auto_1fr_auto] md:items-center"
            >
              <CategoryImage
                src={category.imageUrl}
                name={name}
                className="h-20 w-20 rounded-2xl border border-petal bg-white"
                imageClassName="p-1.5"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-extrabold text-ink">
                    {name}
                  </h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${productStatusTone[category.status] ?? productStatusTone.Active}`}>
                    {translateProductStatus(category.status, t)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {getCategorySubtitle(category, language)}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-terracotta">
                  <span>{t("productCount", { count: formatNumber(count) })}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/admin/categories/${category.id}/edit`}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow-sm hover:bg-petal"
                  aria-label={t("editCategory")}
                >
                  <Edit3 className="h-4 w-4" aria-hidden="true" />
                </Link>
                {pendingDeleteId === category.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => remove(category)}
                      className="rounded-full bg-sale px-3 py-2 text-xs font-bold text-white"
                    >
                      {t("delete")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId("")}
                      className="rounded-full bg-white px-3 py-2 text-xs font-bold text-muted shadow-sm hover:bg-petal hover:text-ink"
                    >
                      {t("cancel")}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(category.id)}
                    className="grid h-9 w-9 place-items-center rounded-full bg-white text-muted shadow-sm hover:bg-sale hover:text-white"
                    aria-label={t("deleteCategory")}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
