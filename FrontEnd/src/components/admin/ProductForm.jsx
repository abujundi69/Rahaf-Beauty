import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api/adminApi.js";
import { toArabicError } from "../../api/httpClient.js";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import Button from "../Button.jsx";
import ProductMediaUploader from "./ProductMediaUploader.jsx";
import {
  getCategoryName,
} from "../../utils/catalog.js";
import {
  getProductMediaImages,
  getProductMediaVideo,
} from "../../utils/media.js";

const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const hexColorPattern = /^#[0-9A-Fa-f]{6}$/;

const emptyProduct = {
  nameAr: "",
  brandName: "",
  categoryId: "",
  price: "",
  status: "Active",
  colors: [],
  sizes: [],
  descriptionAr: "",
  ingredientsAr: "",
  howToUseAr: "",
  media: {
    images: [],
    video: null,
  },
  isNew: true,
};

function toNullableNumber(value) {
  if (value === "" || value == null) return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

function validGuid(value) {
  return guidPattern.test(String(value ?? ""));
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  as = "input",
  error = "",
  ...props
}) {
  const Component = as;
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <Component
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className="mt-2 w-full rounded-[1.1rem] bg-white px-4 py-3 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/70"
        {...props}
      />
      {error ? <span className="mt-2 block text-xs font-bold text-sale">{error}</span> : null}
    </label>
  );
}

export default function ProductForm({ product, mode = "add" }) {
  const {
    categories,
    addProduct,
    updateProduct,
    refreshCatalog,
  } = useCatalog();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const initial = useMemo(
    () =>
      product
        ? {
            nameAr: product.nameAr || product.name || "",
            brandName: product.brandName || product.brand || "",
            categoryId: product.categoryId || "",
            price: String(product.basePrice ?? product.price ?? ""),
            status: product.status === "Draft" ? "Draft" : "Active",
            colors: (product.colors ?? []).map((color) => ({
              ...color,
              nameAr: color.nameAr || color.nameEn || color.name || "",
              hex: color.hex || "#E9B0BF",
            })),
            sizes: (product.sizes ?? []).map((size) => ({
              id: size.id,
              label: size.label ?? "",
              price: size.price === "" || size.price == null ? "" : String(size.price),
            })),
            descriptionAr: product.descriptionAr || product.description || "",
            ingredientsAr: product.ingredientsAr || product.ingredients || "",
            howToUseAr: product.howToUseAr || product.howToUse || "",
            media: {
              images: getProductMediaImages(product),
              video: getProductMediaVideo(product),
            },
            isNew: Boolean(product.isNew),
          }
        : {
            ...emptyProduct,
            categoryId: categories[0]?.id ?? "",
          },
    [categories, product],
  );
  const [form, setForm] = useState(initial);
  const [mediaError, setMediaError] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setForm(initial);
    setMediaError("");
    setErrors({});
    setSubmitError("");
  }, [initial]);

  const update = (key, value) => {
    setMediaError("");
    setSubmitError("");
    setErrors((current) => ({ ...current, [key]: "" }));
    setForm((current) => ({ ...current, [key]: value }));
  };
  const updateImages = (images) => {
    setMediaError("");
    setForm((current) => ({
      ...current,
      media: {
        ...(current.media ?? {}),
        images,
      },
    }));
  };
  const updateVideo = (video) => {
    setMediaError("");
    setForm((current) => ({
      ...current,
      media: {
        ...(current.media ?? {}),
        video,
      },
    }));
  };
  const addColor = () => {
    setForm((current) => ({
      ...current,
      colors: [
        ...(current.colors ?? []),
        {
          id: `color-${Date.now()}`,
          nameAr: "",
          hex: "#E9B0BF",
        },
      ],
    }));
  };
  const updateColor = (colorId, key, value) => {
    setErrors((current) => ({ ...current, [`color-${colorId}`]: "" }));
    setForm((current) => ({
      ...current,
      colors: (current.colors ?? []).map((color) =>
        color.id === colorId ? { ...color, [key]: value } : color,
      ),
    }));
  };
  const removeColor = (colorId) => {
    setErrors((current) => ({ ...current, [`color-${colorId}`]: "" }));
    setForm((current) => ({
      ...current,
      colors: (current.colors ?? []).filter((color) => color.id !== colorId),
    }));
  };
  const addSize = () => {
    setForm((current) => ({
      ...current,
      sizes: [
        ...(current.sizes ?? []),
        {
          id: `size-${Date.now()}`,
          label: "",
          price: "",
        },
      ],
    }));
  };
  const updateSize = (sizeId, key, value) => {
    setErrors((current) => ({ ...current, [`size-${sizeId}`]: "" }));
    setForm((current) => ({
      ...current,
      sizes: (current.sizes ?? []).map((size) =>
        size.id === sizeId ? { ...size, [key]: value } : size,
      ),
    }));
  };
  const removeSize = (sizeId) => {
    setErrors((current) => ({ ...current, [`size-${sizeId}`]: "" }));
    setForm((current) => ({
      ...current,
      sizes: (current.sizes ?? []).filter((size) => size.id !== sizeId),
    }));
  };

  const validate = () => {
    const nextErrors = {};
    const basePrice = Number(form.price);

    if (!form.nameAr.trim()) nextErrors.nameAr = t("fieldRequired");
    if (!form.categoryId) nextErrors.categoryId = t("fieldRequired");
    if (form.price === "" || Number.isNaN(basePrice) || basePrice < 0) {
      nextErrors.price = t("validationBasePrice");
    }

    (form.sizes ?? []).forEach((size) => {
      const key = `size-${size.id}`;
      const price = size.price === "" ? null : Number(size.price);

      if (!String(size.label ?? "").trim()) {
        nextErrors[key] = t("validationSizeLabel");
      } else if (price !== null && (Number.isNaN(price) || price < 0)) {
        nextErrors[key] = t("validationSizePrice");
      }
    });

    const colorNames = new Set();
    (form.colors ?? []).forEach((color) => {
      const key = `color-${color.id}`;
      const name = String(color.nameAr ?? "").trim();
      const hex = color.hex || "";
      const normalizedName = name.toLowerCase();

      if (!name) {
        nextErrors[key] = t("validationColorName");
      } else if (!hexColorPattern.test(hex)) {
        nextErrors[key] = t("validationColorHex");
      } else if (colorNames.has(normalizedName)) {
        nextErrors[key] = t("validationColorDuplicate");
      } else {
        colorNames.add(normalizedName);
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = () => ({
    name: form.nameAr.trim(),
    slug: product?.slug ?? null,
    brandName: form.brandName?.trim() || null,
    brandId: null,
    categoryId: form.categoryId,
    basePrice: Number(form.price),
    description: form.descriptionAr?.trim() || null,
    ingredients: form.ingredientsAr?.trim() || null,
    howToUse: form.howToUseAr?.trim() || null,
    isActive: form.status !== "Draft",
    isNew: Boolean(form.isNew),
    colors: (form.colors ?? [])
      .map((color) => ({
        id: validGuid(color.id) ? color.id : null,
        name: color.nameAr?.trim() || "",
        hexCode: color.hex || "#E9B0BF",
      }))
      .filter((color) => color.name),
    sizes: (form.sizes ?? [])
      .map((size) => ({
        id: validGuid(size.id) ? size.id : null,
        label: size.label?.trim() ?? "",
        price: toNullableNumber(size.price),
      }))
      .filter((size) => size.label),
    variants: null,
  });

  const syncMedia = async (savedProduct) => {
    const initialImages = initial.media.images ?? [];
    const currentImages = form.media.images ?? [];
    const currentImageIds = new Set(currentImages.map((image) => String(image.id)));
    const removedImages = initialImages.filter(
      (image) => validGuid(image.id) && !currentImageIds.has(String(image.id)),
    );
    await Promise.all(
      removedImages.map((image) => adminApi.deleteProductImage(savedProduct.id, image.id)),
    );

    const newImages = currentImages.filter((image) => image.file);
    await Promise.all(
      newImages.map((image, index) =>
        adminApi.uploadProductImage(savedProduct.id, image.file, {
          altText: form.nameAr,
          sortOrder: index,
        }),
      ),
    );

    const initialVideo = initial.media.video;
    const currentVideo = form.media.video;
    if (initialVideo?.id && validGuid(initialVideo.id) && (!currentVideo || currentVideo.id !== initialVideo.id)) {
      await adminApi.deleteProductVideo(savedProduct.id, initialVideo.id);
    }
    if (currentVideo?.file) {
      await adminApi.uploadProductVideo(savedProduct.id, currentVideo.file);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const mediaImages = form.media.images ?? [];

    if (mediaImages.length === 0) {
      setMediaError(t("imageRequired"));
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const payload = buildPayload();
      const savedProduct =
        mode === "edit" && product
          ? await updateProduct(product.id, payload)
          : await addProduct(payload);
      await syncMedia(savedProduct);
      await refreshCatalog();
      navigate("/admin/products");
    } catch (error) {
      setSubmitError(toArabicError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="beauty-shell min-w-0 p-5 md:p-6">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          {mode === "edit" ? t("editProduct") : t("addProduct")}
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink">
          {mode === "edit" ? t("editProduct") : t("addProduct")}
        </h2>
        {submitError ? (
          <p className="mt-4 rounded-2xl bg-sale/10 px-4 py-3 text-sm font-bold text-sale">
            {submitError}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t("nameArabic")} value={form.nameAr} onChange={(value) => update("nameAr", value)} error={errors.nameAr} />
        <Field label={`${t("brand")} (${t("optional")})`} value={form.brandName} onChange={(value) => update("brandName", value)} />
        <label className="block text-sm font-bold text-ink">
          {t("category")}
          <select
            value={form.categoryId}
            onChange={(event) => update("categoryId", event.target.value)}
            className="mt-2 h-12 w-full rounded-full bg-white px-4 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/70"
            aria-invalid={Boolean(errors.categoryId)}
          >
            <option value="">اختاري التصنيف</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {getCategoryName(category, language)}
              </option>
            ))}
          </select>
          {errors.categoryId ? <span className="mt-2 block text-xs font-bold text-sale">{errors.categoryId}</span> : null}
        </label>
        <Field label={t("price")} type="number" min="0" step="0.01" value={form.price} onChange={(value) => update("price", value)} error={errors.price} />
        <label className="block text-sm font-bold text-ink">
          {t("status")}
          <select
            value={form.status}
            onChange={(event) => update("status", event.target.value)}
            className="mt-2 h-12 w-full rounded-full bg-white px-4 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/70"
          >
            <option value="Active">{t("active")}</option>
            <option value="Draft">{t("draft")}</option>
          </select>
        </label>

        <section className="rounded-[1.2rem] border border-petal/60 bg-ivory/80 p-4 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-ink">{t("availableColors")}</p>
              <p className="mt-1 text-xs font-semibold text-muted">{t("colors")}</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={addColor}>
              {t("addColor")}
            </Button>
          </div>
          <div className="mt-4 grid gap-3">
            {(form.colors ?? []).map((color) => (
              <div key={color.id} className="grid gap-3 rounded-2xl border border-petal/50 bg-white p-3 md:grid-cols-[1fr_7rem_auto] md:items-end">
                <Field
                  label={t("colorNameArabic")}
                  value={color.nameAr ?? ""}
                  onChange={(value) => updateColor(color.id, "nameAr", value)}
                  error={errors[`color-${color.id}`]}
                />
                <Field label={t("colorHex")} type="color" value={color.hex || "#E9B0BF"} onChange={(value) => updateColor(color.id, "hex", value)} />
                <Button type="button" size="sm" variant="outline" onClick={() => removeColor(color.id)}>
                  {t("removeColor")}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.2rem] border border-petal/60 bg-ivory/80 p-4 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-ink">{t("availableSizes")}</p>
              <p className="mt-1 text-xs font-semibold text-muted">{t("sizes")}</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={addSize}>
              {t("addSize")}
            </Button>
          </div>
          <div className="mt-4 grid gap-3">
            {(form.sizes ?? []).map((size) => (
              <div key={size.id} className="rounded-2xl border border-petal/50 bg-white p-3">
                <div className="grid gap-3 md:grid-cols-[1fr_10rem_auto] md:items-end">
                  <Field label={t("sizeLabel")} value={size.label ?? ""} onChange={(value) => updateSize(size.id, "label", value)} />
                  <Field label={t("sizePrice")} type="number" min="0" step="0.01" value={size.price ?? ""} onChange={(value) => updateSize(size.id, "price", value)} />
                  <Button type="button" size="sm" variant="outline" onClick={() => removeSize(size.id)}>
                    {t("removeSize")}
                  </Button>
                </div>
                {errors[`size-${size.id}`] ? (
                  <p className="mt-3 rounded-2xl bg-sale/10 px-4 py-3 text-xs font-bold text-sale">
                    {errors[`size-${size.id}`]}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <ProductMediaUploader
          images={form.media.images}
          video={form.media.video}
          error={mediaError}
          onImagesChange={updateImages}
          onVideoChange={updateVideo}
        />
        <div className="grid gap-3 rounded-[1.2rem] border border-petal/60 bg-ivory/80 p-4">
          <label className="flex items-center gap-3 text-sm font-bold text-ink">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(event) => update("isNew", event.target.checked)}
              className="h-4 w-4 rounded border-shell text-terracotta focus:ring-terracotta"
            />
            {t("newBadge")}
          </label>
        </div>
        <Field label={t("descriptionArabic")} value={form.descriptionAr} onChange={(value) => update("descriptionAr", value)} as="textarea" />
        <Field label={t("ingredients")} value={form.ingredientsAr} onChange={(value) => update("ingredientsAr", value)} as="textarea" />
        <Field label={t("howToUse")} value={form.howToUseAr} onChange={(value) => update("howToUseAr", value)} as="textarea" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? t("loading") : t("save")}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate("/admin/products")}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
