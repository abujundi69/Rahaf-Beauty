import { ImagePlus, X } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button.jsx";
import { toArabicError } from "../../api/httpClient.js";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

const emptyCategory = {
  slug: "",
  imageUrl: "",
  status: "Active",
  nameEn: "",
  nameAr: "",
  subtitleEn: "",
  subtitleAr: "",
  introEn: "",
  introAr: "",
};

function Field({ label, value, onChange, as = "input" }) {
  const Component = as;
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <Component
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/25"
      />
    </label>
  );
}

function slugFromArabic(value) {
  const base = String(value || "category").trim();
  return `category-${base.length}-${Date.now()}`;
}

export default function CategoryForm({ category, mode = "add" }) {
  const { addCategory, updateCategory } = useCatalog();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const imageInputId = useId();
  const initial = useMemo(
    () =>
      category
        ? {
            ...category,
            imageUrl: category.imageUrl || category.image || "",
            imagePath: category.imagePath || "",
            nameAr: category.nameAr || category.nameEn || "",
            subtitleAr: category.subtitleAr || category.subtitleEn || "",
            introAr: category.introAr || category.introEn || "",
          }
        : emptyCategory,
    [category],
  );
  const [form, setForm] = useState(initial);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initial.imageUrl || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    setForm(initial);
    setImageFile(null);
    setImagePreview(initial.imageUrl || "");
  }, [initial]);

  useEffect(
    () => () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    },
    [imagePreview],
  );

  const updateImage = (file) => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : "");
    update("imageUrl", file ? form.imageUrl : "");
    update("imagePath", file ? form.imagePath : "");
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const generatedSlug = form.slug || slugFromArabic(form.nameAr);
    const payload = {
      ...form,
      id: mode === "edit" && category ? category.id : generatedSlug,
      slug: generatedSlug,
      name: form.nameAr,
      nameEn: form.nameAr,
      subtitle: form.subtitleAr,
      subtitleEn: form.subtitleAr,
      intro: form.introAr,
      introEn: form.introAr,
      imageUrl: imageFile ? "" : form.imagePath || imagePreview,
      imageFile,
    };
    try {
      if (mode === "edit" && category) {
        await updateCategory(category.id, payload);
      } else {
        await addCategory(payload);
      }
      navigate("/admin/categories");
    } catch (requestError) {
      setError(toArabicError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="min-w-0 rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          {mode === "edit" ? t("editCategory") : t("addCategory")}
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink">
          {mode === "edit" ? t("editCategory") : t("addCategory")}
        </h2>
        {error ? <p className="mt-4 rounded-2xl bg-sale/10 px-4 py-3 text-sm font-bold text-sale">{error}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-bold text-ink">
          {t("status")}
          <select
            value={form.status ?? "Active"}
            onChange={(event) => update("status", event.target.value)}
            className="mt-2 h-12 w-full rounded-2xl bg-white px-4 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/25"
          >
            <option value="Active">{t("active")}</option>
            <option value="Draft">{t("draft")}</option>
          </select>
        </label>
        <div />
        <Field label={t("categoryTitle")} value={form.nameAr ?? ""} onChange={(value) => update("nameAr", value)} />
        <Field label={t("categorySubtitle")} value={form.subtitleAr ?? ""} onChange={(value) => update("subtitleAr", value)} />
        <div className="md:col-span-2">
          <Field label={t("categoryIntro")} value={form.introAr ?? ""} onChange={(value) => update("introAr", value)} as="textarea" />
        </div>
        <div className="md:col-span-2">
          <p className="text-sm font-bold text-ink">{t("categoryImage")}</p>
          <label
            htmlFor={imageInputId}
            className="mt-2 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-petal bg-white px-5 py-6 text-center transition hover:border-terracotta hover:bg-shell/55"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-shell text-ink">
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="mt-3 text-sm font-extrabold text-ink">
              {imagePreview ? t("replaceImage") : t("chooseImage")}
            </span>
            <span className="mt-1 text-xs font-semibold text-muted">
              {t("acceptedImageFormats")}
            </span>
            <input
              id={imageInputId}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const [file] = Array.from(event.target.files ?? []);
                event.target.value = "";
                if (file) updateImage(file);
              }}
            />
          </label>
          {imagePreview ? (
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-ivory p-3">
              <span className="grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-xl border border-petal bg-white">
                <img src={imagePreview} alt="" className="h-full w-full object-contain p-1.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-ink">
                  {imageFile?.name || t("currentImage")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateImage(null)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-muted transition hover:bg-sale hover:text-white"
                aria-label={t("remove")}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>{submitting ? t("loading") : t("save")}</Button>
        <Button type="button" variant="outline" onClick={() => navigate("/admin/categories")}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
