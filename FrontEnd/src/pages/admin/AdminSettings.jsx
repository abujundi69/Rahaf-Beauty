import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { discountsApi } from "../../api/discountsApi.js";
import { toArabicError } from "../../api/httpClient.js";
import Button from "../../components/Button.jsx";
import BrandLogo from "../../components/BrandLogo.jsx";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useStoreSettings } from "../../context/StoreSettingsContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
  getCategoryName,
  getProductName,
} from "../../utils/catalog.js";
import { mergeStoreSettings } from "../../utils/settings.js";

const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isGuid(value) {
  return guidPattern.test(String(value ?? ""));
}

function emptyDiscounts() {
  return {
    global: {
      id: "",
      percentage: "",
      enabled: false,
      startDate: "",
      endDate: "",
    },
    categories: [],
    products: [],
  };
}

function discountsToSettings(discounts) {
  const next = emptyDiscounts();

  discounts.forEach((discount) => {
    const item = {
      id: discount.id,
      percentage: discount.percentage,
      enabled: discount.isEnabled,
      startDate: discount.startDate ?? "",
      endDate: discount.endDate ?? "",
    };

    if (discount.type === "Global") {
      next.global = item;
    } else if (discount.type === "Category" || discount.type === "Brand") {
      next.categories.push({ ...item, categoryId: discount.scopeId });
    } else if (discount.type === "Product") {
      next.products.push({ ...item, productId: discount.scopeId });
    }
  });

  return next;
}

function SectionCard({ title, description, children }) {
  return (
    <section className="beauty-shell p-5 md:p-6">
      <div className="mb-5">
        <h3 className="font-display text-2xl font-bold text-ink">{title}</h3>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  as = "input",
  placeholder = "",
  disabled = false,
}) {
  const Component = as;
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <Component
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-[1.1rem] bg-white px-4 py-3 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/70 disabled:bg-ivory disabled:text-muted"
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-3 rounded-full border border-petal/60 bg-ivory px-4 py-3 text-sm font-bold text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-shell text-terracotta focus:ring-terracotta"
      />
      {label}
    </label>
  );
}

export default function AdminSettings() {
  const { products, categories: catalogCategories, refreshCatalog } = useCatalog();
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const { settings: liveSettings, saveStoreInfo, saveAnnouncementOnly } = useStoreSettings();
  const [settings, setSettings] = useState(() => mergeStoreSettings(liveSettings));
  const categories = useMemo(() => catalogCategories, [catalogCategories]);
  const [savedStoreInfo, setSavedStoreInfo] = useState(false);
  const [savedAnnouncement, setSavedAnnouncement] = useState(false);
  const [savedDiscounts, setSavedDiscounts] = useState(false);
  const [loadedDiscountIds, setLoadedDiscountIds] = useState(new Set());
  const [error, setError] = useState("");

  useEffect(() => {
    setSettings((current) =>
      mergeStoreSettings({
        ...liveSettings,
        discounts: current.discounts,
      }),
    );
  }, [liveSettings]);

  const loadDiscounts = async () => {
    try {
      const discounts = await discountsApi.list();
      setLoadedDiscountIds(new Set(discounts.map((discount) => discount.id)));
      setSettings((current) =>
        mergeStoreSettings({
          ...current,
          discounts: discountsToSettings(discounts),
        }),
      );
    } catch (requestError) {
      setError(toArabicError(requestError));
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  const update = (key, value) => {
    setSavedStoreInfo(false);
    setSettings((current) => ({ ...current, [key]: value }));
  };
  const updateAnnouncement = (key, value) => {
    setSavedAnnouncement(false);
    setSettings((current) => {
      const nextAnnouncement = { ...current.announcement, [key]: value };
      if (key === "textAr") nextAnnouncement.textEn = value;
      if (key === "linkTextAr") nextAnnouncement.linkTextEn = value;
      return {
        ...current,
        announcement: nextAnnouncement,
      };
    });
  };
  const updateGlobalDiscount = (key, value) => {
    setSavedDiscounts(false);
    setSettings((current) => ({
      ...current,
      discounts: {
        ...current.discounts,
        global: { ...current.discounts.global, [key]: value },
      },
    }));
  };
  const updateCategoryDiscount = (discountId, key, value) => {
    setSavedDiscounts(false);
    setSettings((current) => ({
      ...current,
      discounts: {
        ...current.discounts,
        categories: current.discounts.categories.map((discount) =>
          discount.id !== discountId ? discount : { ...discount, [key]: value },
        ),
      },
    }));
  };
  const updateProductDiscount = (discountId, key, value) => {
    setSavedDiscounts(false);
    setSettings((current) => ({
      ...current,
      discounts: {
        ...current.discounts,
        products: current.discounts.products.map((discount) =>
          discount.id !== discountId ? discount : { ...discount, [key]: value },
        ),
      },
    }));
  };
  const addCategoryDiscount = () => {
    setSavedDiscounts(false);
    setSettings((current) => ({
      ...current,
      discounts: {
        ...current.discounts,
        categories: [
          ...current.discounts.categories,
          {
            id: `category-discount-${Date.now()}`,
            categoryId: categories[0]?.id ?? "",
            percentage: "",
            enabled: true,
            startDate: "",
            endDate: "",
          },
        ],
      },
    }));
  };
  const addProductDiscount = () => {
    setSavedDiscounts(false);
    setSettings((current) => ({
      ...current,
      discounts: {
        ...current.discounts,
        products: [
          ...current.discounts.products,
          {
            id: `product-discount-${Date.now()}`,
            productId: products[0]?.id ?? "",
            percentage: "",
            enabled: true,
            startDate: "",
            endDate: "",
          },
        ],
      },
    }));
  };
  const removeCategoryDiscount = (discountId) => {
    setSavedDiscounts(false);
    setSettings((current) => ({
      ...current,
      discounts: {
        ...current.discounts,
        categories: current.discounts.categories.filter((discount) => discount.id !== discountId),
      },
    }));
  };
  const removeProductDiscount = (discountId) => {
    setSavedDiscounts(false);
    setSettings((current) => ({
      ...current,
      discounts: {
        ...current.discounts,
        products: current.discounts.products.filter((discount) => discount.id !== discountId),
      },
    }));
  };

  const syncDiscounts = async (discounts) => {
    const desired = [
      discounts.global.enabled || Number(discounts.global.percentage)
        ? {
            id: discounts.global.id,
            type: "Global",
            scopeId: null,
            percentage: Number(discounts.global.percentage) || 0,
            label: null,
            isEnabled: Boolean(discounts.global.enabled),
            startDate: discounts.global.startDate || null,
            endDate: discounts.global.endDate || null,
          }
        : null,
      ...discounts.categories
        .filter((discount) => discount.categoryId)
        .map((discount) => ({
          id: discount.id,
          type: "Category",
          scopeId: discount.categoryId,
          percentage: Number(discount.percentage) || 0,
          label: null,
          isEnabled: Boolean(discount.enabled),
          startDate: discount.startDate || null,
          endDate: discount.endDate || null,
        })),
      ...discounts.products
        .filter((discount) => discount.productId)
        .map((discount) => ({
          id: discount.id,
          type: "Product",
          scopeId: discount.productId,
          percentage: Number(discount.percentage) || 0,
          label: null,
          isEnabled: Boolean(discount.enabled),
          startDate: discount.startDate || null,
          endDate: discount.endDate || null,
        })),
    ].filter(Boolean);

    const desiredExistingIds = new Set(
      desired.filter((discount) => isGuid(discount.id)).map((discount) => discount.id),
    );
    const removedIds = [...loadedDiscountIds].filter((id) => !desiredExistingIds.has(id));

    await Promise.all(removedIds.map((id) => discountsApi.delete(id)));
    await Promise.all(
      desired.map(({ id, ...payload }) =>
        isGuid(id)
          ? discountsApi.update(id, payload)
          : discountsApi.create(payload),
      ),
    );
    await loadDiscounts();
  };

  const handleSaveStoreInfo = async () => {
    try {
      setError("");
      await saveStoreInfo(settings);
      setSavedStoreInfo(true);
      showToast({ message: t("settingsUpdated") });
    } catch (requestError) {
      setError(toArabicError(requestError));
    }
  };

  const handleSaveAnnouncement = async () => {
    try {
      setError("");
      await saveAnnouncementOnly({
        ...settings.announcement,
        textEn: settings.announcement.textAr,
        linkTextEn: settings.announcement.linkTextAr,
      });
      setSavedAnnouncement(true);
      showToast({ message: t("settingsUpdated") });
    } catch (requestError) {
      setError(toArabicError(requestError));
    }
  };

  const handleSaveDiscounts = async () => {
    try {
      setError("");
      await syncDiscounts(settings.discounts);
      await refreshCatalog();
      setSavedDiscounts(true);
      showToast({ message: t("settingsUpdated") });
    } catch (requestError) {
      setError(toArabicError(requestError));
    }
  };

  return (
    <div className="space-y-6">
      <div className="beauty-shell p-5 md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          {t("storeSettings")}
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink">
          {t("storeSettings")}
        </h2>
        {error ? (
          <p className="mt-4 rounded-2xl bg-sale/10 px-4 py-3 text-sm font-bold text-sale">
            {error}
          </p>
        ) : null}
      </div>

      <SectionCard title="معلومات المتجر">
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <div className="rounded-[1.2rem] border border-petal/60 bg-ivory/80 p-4">
            <p className="text-sm font-bold text-ink">{t("storeLogo")}</p>
            <BrandLogo size="settings" className="mt-3 rounded-2xl bg-white p-1 shadow-sm" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("storeName")} value={settings.storeName} onChange={(value) => update("storeName", value)} />
            <label className="block text-sm font-bold text-ink">
              {t("currency")}
              <select
                value={settings.currency}
                onChange={(event) => update("currency", event.target.value)}
                className="mt-2 h-12 w-full rounded-full bg-white px-4 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/70"
              >
                <option value="ILS">شيكل إسرائيلي (₪)</option>
              </select>
            </label>
            <Field label={t("contactEmail")} value={settings.contactEmail} onChange={(value) => update("contactEmail", value)} />
            <Field label={t("phoneNumber")} value={settings.phone} onChange={(value) => update("phone", value)} />
            <div className="md:col-span-2">
              <Field label={t("address")} value={settings.address} onChange={(value) => update("address", value)} as="textarea" />
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-3">
          {savedStoreInfo ? (
            <span className="inline-flex rounded-full bg-olive/10 px-3 py-1 text-xs font-bold text-olive">
              {t("settingsSaved")}
            </span>
          ) : null}
          <Button onClick={handleSaveStoreInfo}>{t("save")}</Button>
        </div>
      </SectionCard>

      <SectionCard title="شريط الإعلان العلوي" description="يتحكم هذا القسم بالشريط الرفيع أعلى واجهة المتجر.">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Toggle
            label={t("enableAnnouncementBar")}
            checked={settings.announcement.enabled}
            onChange={(value) => updateAnnouncement("enabled", value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("announcementTextArabic")} value={settings.announcement.textAr} onChange={(value) => updateAnnouncement("textAr", value)} />
          <Field label={t("backgroundColor")} type="color" value={settings.announcement.backgroundColor} onChange={(value) => updateAnnouncement("backgroundColor", value)} />
          <Field label={t("textColor")} type="color" value={settings.announcement.textColor} onChange={(value) => updateAnnouncement("textColor", value)} />
          <Field label={`${t("linkText")} (${t("optional")})`} value={settings.announcement.linkTextAr} onChange={(value) => updateAnnouncement("linkTextAr", value)} />
          <Field label={t("linkUrl")} value={settings.announcement.linkUrl} onChange={(value) => updateAnnouncement("linkUrl", value)} />
          <Field label={t("startDate")} type="date" value={settings.announcement.startDate} onChange={(value) => updateAnnouncement("startDate", value)} />
          <Field label={t("endDate")} type="date" value={settings.announcement.endDate} onChange={(value) => updateAnnouncement("endDate", value)} />
        </div>
        <div className="mt-5">
          <p className="mb-2 text-sm font-bold text-ink">{t("announcementPreview")}</p>
          <div
            className="rounded-2xl px-4 py-3 text-center text-sm font-bold"
            style={{
              backgroundColor: settings.announcement.backgroundColor,
              color: settings.announcement.textColor,
            }}
          >
            {settings.announcement.enabled ? settings.announcement.textAr : t("disabled")}
            {settings.announcement.linkTextAr ? ` - ${settings.announcement.linkTextAr}` : ""}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-3">
          {savedAnnouncement ? (
            <span className="inline-flex rounded-full bg-olive/10 px-3 py-1 text-xs font-bold text-olive">
              {t("settingsSaved")}
            </span>
          ) : null}
          <Button onClick={handleSaveAnnouncement}>{t("save")}</Button>
        </div>
      </SectionCard>

      <SectionCard title="إعدادات الخصومات" description="أولوية الخصومات: المنتج > الفئة > الخصم العام">
        <div className="space-y-4">
          <div className="rounded-[1.2rem] border border-petal/60 bg-ivory/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-extrabold text-ink">{t("globalDiscount")}</p>
              <Toggle
                label={t("enabled")}
                checked={settings.discounts.global.enabled}
                onChange={(value) => updateGlobalDiscount("enabled", value)}
              />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label={t("discountPercentage")} type="number" value={settings.discounts.global.percentage} onChange={(value) => updateGlobalDiscount("percentage", value)} />
              <Field label={t("startDate")} type="date" value={settings.discounts.global.startDate} onChange={(value) => updateGlobalDiscount("startDate", value)} />
              <Field label={t("endDate")} type="date" value={settings.discounts.global.endDate} onChange={(value) => updateGlobalDiscount("endDate", value)} />
            </div>
          </div>

          <div className="rounded-[1.2rem] border border-petal/60 bg-ivory/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-extrabold text-ink">خصومات حسب الفئة</p>
              <Button type="button" size="sm" variant="outline" onClick={addCategoryDiscount}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                إضافة خصم فئة
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {settings.discounts.categories.map((discount) => (
                <div key={discount.id} className="grid gap-3 rounded-2xl border border-petal/50 bg-white p-3 lg:grid-cols-[1fr_8rem_9rem_9rem_auto] lg:items-end">
                  <label className="block text-sm font-bold text-ink">
                    {t("category")}
                    <select
                      value={discount.categoryId}
                      onChange={(event) => updateCategoryDiscount(discount.id, "categoryId", event.target.value)}
                      className="mt-2 h-12 w-full rounded-full bg-white px-4 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/70"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {getCategoryName(category, language)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field label={t("discountPercentage")} type="number" value={discount.percentage} onChange={(value) => updateCategoryDiscount(discount.id, "percentage", value)} />
                  <Field label={t("startDate")} type="date" value={discount.startDate ?? ""} onChange={(value) => updateCategoryDiscount(discount.id, "startDate", value)} />
                  <Field label={t("endDate")} type="date" value={discount.endDate ?? ""} onChange={(value) => updateCategoryDiscount(discount.id, "endDate", value)} />
                  <div className="flex items-center gap-2">
                    <Toggle label={t("enabled")} checked={discount.enabled} onChange={(value) => updateCategoryDiscount(discount.id, "enabled", value)} />
                    <button
                      type="button"
                      onClick={() => removeCategoryDiscount(discount.id)}
                      className="grid h-11 w-11 place-items-center rounded-full bg-white text-muted hover:bg-sale hover:text-white"
                      aria-label={t("remove")}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.2rem] border border-petal/60 bg-ivory/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-extrabold text-ink">{t("productDiscounts")}</p>
              <Button type="button" size="sm" variant="outline" onClick={addProductDiscount}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t("addProductDiscount")}
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {settings.discounts.products.map((discount) => (
                <div key={discount.id} className="grid gap-3 rounded-2xl border border-petal/50 bg-white p-3 lg:grid-cols-[1.5fr_8rem_9rem_9rem_auto] lg:items-end">
                  <label className="block text-sm font-bold text-ink">
                    {t("products")}
                    <select
                      value={discount.productId}
                      onChange={(event) => updateProductDiscount(discount.id, "productId", event.target.value)}
                      className="mt-2 h-12 w-full rounded-full bg-white px-4 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/70"
                    >
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {getProductName(product, language)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field label={t("discountPercentage")} type="number" value={discount.percentage} onChange={(value) => updateProductDiscount(discount.id, "percentage", value)} />
                  <Field label={t("startDate")} type="date" value={discount.startDate ?? ""} onChange={(value) => updateProductDiscount(discount.id, "startDate", value)} />
                  <Field label={t("endDate")} type="date" value={discount.endDate ?? ""} onChange={(value) => updateProductDiscount(discount.id, "endDate", value)} />
                  <div className="flex items-center gap-2">
                    <Toggle label={t("enabled")} checked={discount.enabled} onChange={(value) => updateProductDiscount(discount.id, "enabled", value)} />
                    <button
                      type="button"
                      onClick={() => removeProductDiscount(discount.id)}
                      className="grid h-11 w-11 place-items-center rounded-full bg-white text-muted hover:bg-sale hover:text-white"
                      aria-label={t("remove")}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="flex items-center justify-end gap-3">
        {savedDiscounts ? (
          <span className="inline-flex rounded-full bg-olive/10 px-3 py-1 text-xs font-bold text-olive">
            {t("settingsSaved")}
          </span>
        ) : null}
        <Button onClick={handleSaveDiscounts}>{t("save")}</Button>
      </div>
    </div>
  );
}
