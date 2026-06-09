import { Edit3, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { brandsApi } from "../../api/brandsApi.js";
import { toArabicError } from "../../api/httpClient.js";
import Button from "../../components/Button.jsx";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

const emptyBrand = {
  name: "",
  description: "",
  isActive: true,
};

function Field({ label, value, onChange, as = "input" }) {
  const Component = as;
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <Component
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl bg-ivory px-4 py-3 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/25"
      />
    </label>
  );
}

export default function AdminBrands() {
  const { brands, refreshCatalog } = useCatalog();
  const { t } = useLanguage();
  const [form, setForm] = useState(emptyBrand);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editingId) setForm(emptyBrand);
  }, [editingId]);

  const update = (key, value) => {
    setError("");
    setForm((current) => ({ ...current, [key]: value }));
  };

  const edit = (brand) => {
    setEditingId(brand.id);
    setForm({
      name: brand.name,
      description: brand.description ?? "",
      isActive: brand.isActive,
    });
  };

  const save = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      slug: null,
      description: form.description.trim() || null,
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await brandsApi.update(editingId, payload);
      } else {
        await brandsApi.create(payload);
      }
      await refreshCatalog();
      setEditingId("");
      setForm(emptyBrand);
    } catch (requestError) {
      setError(toArabicError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (brandId) => {
    try {
      await brandsApi.delete(brandId);
      await refreshCatalog();
    } catch (requestError) {
      setError(toArabicError(requestError));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          {t("brands")}
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink">
          {editingId ? t("edit") : t("addBrand")}
        </h2>
        {error ? (
          <p className="mt-4 rounded-2xl bg-sale/10 px-4 py-3 text-sm font-bold text-sale">
            {error}
          </p>
        ) : null}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label={t("brand")} value={form.name} onChange={(value) => update("name", value)} />
          <label className="flex items-center gap-3 rounded-2xl bg-ivory px-4 py-3 text-sm font-bold text-ink">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => update("isActive", event.target.checked)}
              className="h-4 w-4 rounded border-shell text-terracotta focus:ring-terracotta"
            />
            {t("active")}
          </label>
          <div className="md:col-span-2">
            <Field label={t("description")} value={form.description} onChange={(value) => update("description", value)} as="textarea" />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="submit" disabled={submitting}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {submitting ? t("loading") : t("save")}
          </Button>
          {editingId ? (
            <Button type="button" variant="outline" onClick={() => setEditingId("")}>
              {t("cancel")}
            </Button>
          ) : null}
        </div>
      </form>

      <section className="grid gap-3">
        {brands.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm font-bold text-muted shadow-sm">
            {t("noData")}
          </div>
        ) : null}
        {brands.map((brand) => (
          <article key={brand.id} className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-[1fr_auto]">
            <div>
              <h3 className="text-lg font-extrabold text-ink">{brand.name}</h3>
              {brand.description ? <p className="mt-2 text-sm text-muted">{brand.description}</p> : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => edit(brand)}
                className="grid h-9 w-9 place-items-center rounded-full bg-ivory text-ink"
                aria-label={t("edit")}
              >
                <Edit3 className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => remove(brand.id)}
                className="grid h-9 w-9 place-items-center rounded-full bg-ivory text-muted hover:bg-sale hover:text-white"
                aria-label={t("delete")}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
