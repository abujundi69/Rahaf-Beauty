import { Edit3, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../Button.jsx";
import ProductVisual from "../ProductVisual.jsx";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useStoreSettings } from "../../context/StoreSettingsContext.jsx";
import {
  formatPrice,
  getBrandName,
  getCategoryName,
  getProductName,
} from "../../utils/catalog.js";
import { calculateProductPricing } from "../../utils/pricing.js";
import { productStatusTone, translateProductStatus } from "../../utils/status.js";

export default function AdminProductsTable() {
  const { products, categories, categoryMap, deleteProduct } = useCatalog();
  const { language, t } = useLanguage();
  const { settings } = useStoreSettings();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState("");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const category = categoryMap[product.category];
      const matchesQuery =
        !normalizedQuery ||
        [
          product.nameEn,
          product.nameAr,
          product.brand,
          category?.nameEn,
          category?.nameAr,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesCategory = !categoryId || product.category === categoryId;
      return matchesQuery && matchesCategory;
    });
  }, [products, query, categoryId, categoryMap]);

  const remove = async (product) => {
    await deleteProduct(product.id);
    setPendingDeleteId("");
  };

  return (
    <section className="min-w-0 rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
            {t("manageProducts")}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink">
            {t("products")}
          </h2>
        </div>
        <Button as={Link} to="/admin/products/new">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("addProduct")}
        </Button>
      </div>

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_220px]">
        <label className="relative block">
          <Search className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchProducts")}
            className="h-11 w-full rounded-2xl bg-ivory pe-4 ps-11 text-sm text-ink outline-none focus:ring-4 focus:ring-shell/25"
          />
        </label>
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="h-11 rounded-2xl bg-ivory px-4 text-sm font-semibold text-ink outline-none focus:ring-4 focus:ring-shell/25"
        >
          <option value="">{t("categories")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {getCategoryName(category, language)}
            </option>
          ))}
        </select>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-y-2 text-sm">
          <thead className="text-start text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-4 py-2 text-start">{t("products")}</th>
              <th className="px-4 py-2 text-start">{t("category")}</th>
              <th className="px-4 py-2 text-start">{t("price")}</th>
              <th className="px-4 py-2 text-start">{t("status")}</th>
              <th className="px-4 py-2 text-end">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const pricing = calculateProductPricing(product, settings);
              return (
              <tr key={product.id} className="bg-ivory">
                <td className="rounded-s-2xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProductVisual product={product} className="h-14 w-14 shrink-0 rounded-xl" />
                    <div>
                      <p className="font-extrabold text-ink">{getProductName(product, language)}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
                        {getBrandName(product.brand)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">
                  {getCategoryName(categoryMap[product.category], language)}
                </td>
                <td className="px-4 py-3 font-bold text-ink">
                  <span>{formatPrice(pricing.finalPrice, language)}</span>
                  {pricing.hasDiscount ? (
                    <span className="mt-1 block text-xs font-semibold text-muted line-through">
                      {formatPrice(pricing.originalPrice, language)}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${productStatusTone[product.status] ?? productStatusTone.Active}`}>
                    {translateProductStatus(product.status, t)}
                  </span>
                </td>
                <td className="rounded-e-2xl px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/admin/products/${product.id}`}
                      className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow-sm hover:bg-petal"
                      aria-label={t("productPreview")}
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link
                      to={`/admin/products/${product.id}/edit`}
                      className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow-sm hover:bg-petal"
                      aria-label={t("editProduct")}
                    >
                      <Edit3 className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    {pendingDeleteId === product.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => remove(product)}
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
                        onClick={() => setPendingDeleteId(product.id)}
                        className="grid h-9 w-9 place-items-center rounded-full bg-white text-muted shadow-sm hover:bg-sale hover:text-white"
                        aria-label={t("deleteProduct")}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
