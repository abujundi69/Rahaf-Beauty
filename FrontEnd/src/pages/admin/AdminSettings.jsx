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
  getBrandName,
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
      labelAr: "",
      labelEn: "",
      startDate: "",
      endDate: "",
    },
    brands: [],
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
      labelAr: discount.label ?? "",
      labelEn: discount.label ?? "",
      startDate: discount.startDate ?? "",
      endDate: discount.endDate ?? "",
    };

    if (discount.type === "Global") {
      next.global = item;
    } else if (discount.type === "Brand") {
      next.brands.push({ ...item, brand: discount.scopeId });
    } else if (discount.type === "Product") {
      next.products.push({ ...item, productId: discount.scopeId });
    }
  });

  return next;
}

function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
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
        className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/25 disabled:bg-ivory disabled:text-muted"
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-3 rounded-2xl bg-ivory px-4 py-3 text-sm font-bold text-ink">
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
  const { products, brands: catalogBrands, refreshCatalog } = useCatalog();
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const { settings: liveSettings, saveSettings } = useStoreSettings();
  const [settings, setSettings] = useState(() => mergeStoreSettings(liveSettings));
  const brands = useMemo(() => catalogBrands, [catalogBrands]);
  const [saved, setSaved] = useState(false);
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
    setSaved(false);
    setSettings((current) => ({ ...current, [key]: value }));
  };
  const updateAnnouncement = (key, value) => {
    setSaved(false);
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
    setSaved(false);
    setSettings((current) => {
      const nextGlobal = { ...current.discounts.global, [key]: value };
      if (key === "labelAr") nextGlobal.labelEn = value;
      return {
        ...current,
        discounts: {
          ...current.discounts,
          global: nextGlobal,
        },
      };
    });
  };
  const updateBrandDiscount = (discountId, key, value) => {
    setSaved(false);
    setSettings((current) => ({
      ...current,
      discounts: {
        ...current.discounts,
        brands: current.discounts.brands.map((discount) => {
          if (discount.id !== discountId) return discount;
          const nextDiscount = { ...discount, [key]: value };
          if (key === "labelAr") nextDiscount.labelEn = value;
          return nextDiscount;
        }),
      },
    }));
  };
  const updateProductDiscount = (discountId, key, value) => {
    setSaved(false);
    setSettings((current) => ({
      ...current,
      discounts: {
        ...current.discounts,
        products: current.discounts.products.map((discount) => {
          if (discount.id !== discountId) return discount;
          const nextDiscount = { ...discount, [key]: value };
          if (key === "labelAr") nextDiscount.labelEn = value;
          return nextDiscount;
        }),
      },
    }));
  };
  const addBrandDiscount = () => {
    setSaved(false);
    setSettings((current) => ({
      ...current,
      discounts: {
        ...current.discounts,
        brands: [
          ...current.discounts.brands,
          {
            id: `brand-discount-${Date.now()}`,
            brand: brands[0]?.id ?? "",
            percentage: "",
            enabled: true,
            labelAr: "",
            labelEn: "",
            startDate: "",
            endDate: "",
          },
        ],
      },
    }));
  };
  const addProductDiscount = () => {
    setSaved(false);
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
            labelAr: "",
            labelEn: "",
            startDate: "",
            endDate: "",
          },
        ],
      },
    }));
  };
  const removeBrandDiscount = (discountId) => {
    setSaved(false);
    setSettings((current) => ({
      ...current,
      discounts: {
        ...current.discounts,
        brands: current.discounts.brands.filter((discount) => discount.id !== discountId),
      },
    }));
  };
  const removeProductDiscount = (discountId) => {
    setSaved(false);
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
            label: discounts.global.labelAr || null,
            isEnabled: Boolean(discounts.global.enabled),
            startDate: discounts.global.startDate || null,
            endDate: discounts.global.endDate || null,
          }
        : null,
      ...discounts.brands
        .filter((discount) => discount.brand)
        .map((discount) => ({
          id: discount.id,
          type: "Brand",
          scopeId: discount.brand,
          percentage: Number(discount.percentage) || 0,
          label: discount.labelAr || null,
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
          label: discount.labelAr || null,
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

  const save = async () => {
    try {
      setError("");
      const nextSettings = await saveSettings({
        ...settings,
        defaultLanguage: "ar",
        announcement: {
          ...settings.announcement,
          textEn: settings.announcement.textAr,
          linkTextEn: settings.announcement.linkTextAr,
        },
      });
      await syncDiscounts(settings.discounts);
      await refreshCatalog();
      setSettings((current) => mergeStoreSettings({ ...nextSettings, discounts: current.discounts }));
      setSaved(true);
      showToast({ message: t("settingsUpdated") });
    } catch (requestError) {
      setError(toArabicError(requestError));
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          {t("storeSettings")}
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink">
          {t("storeSettings")}
        </h2>
        {saved ? (
          <span className="mt-4 inline-flex rounded-full bg-olive/10 px-3 py-1 text-xs font-bold text-olive">
            {t("settingsSaved")}
          </span>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-2xl bg-sale/10 px-4 py-3 text-sm font-bold text-sale">
            {error}
          </p>
        ) : null}
      </div>

      <SectionCard title="معلومات المتجر">
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <div className="rounded-2xl bg-ivory p-4">
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
                className="mt-2 h-12 w-full rounded-2xl bg-white px-4 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/25"
              >
                <option value="SAR">ريال سعودي (SAR)</option>
              </select>
            </label>
            <Field label={t("contactEmail")} value={settings.contactEmail} onChange={(value) => update("contactEmail", value)} />
            <Field label={t("phoneNumber")} value={settings.phone} onChange={(value) => update("phone", value)} />
            <div className="md:col-span-2">
              <Field label={t("address")} value={settings.address} onChange={(value) => update("address", value)} as="textarea" />
            </div>
          </div>
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
      </SectionCard>

      <SectionCard title="إعدادات الخصومات" description={t("discountPriority")}>
        <div className="space-y-4">
          <div className="rounded-2xl bg-ivory p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-extrabold text-ink">{t("globalDiscount")}</p>
              <Toggle
                label={t("enabled")}
                checked={settings.discounts.global.enabled}
                onChange={(value) => updateGlobalDiscount("enabled", value)}
              />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Field label={t("discountPercentage")} type="number" value={settings.discounts.global.percentage} onChange={(value) => updateGlobalDiscount("percentage", value)} />
              <Field label={t("discountLabel")} value={settings.discounts.global.labelAr} onChange={(value) => updateGlobalDiscount("labelAr", value)} />
              <Field label={t("startDate")} type="date" value={settings.discounts.global.startDate} onChange={(value) => updateGlobalDiscount("startDate", value)} />
              <Field label={t("endDate")} type="date" value={settings.discounts.global.endDate} onChange={(value) => updateGlobalDiscount("endDate", value)} />
            </div>
          </div>

          <div className="rounded-2xl bg-ivory p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-extrabold text-ink">{t("brandDiscounts")}</p>
              <Button type="button" size="sm" variant="outline" onClick={addBrandDiscount}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t("addBrandDiscount")}
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {settings.discounts.brands.map((discount) => (
                <div key={discount.id} className="grid gap-3 rounded-2xl bg-white p-3 lg:grid-cols-[1fr_8rem_1fr_9rem_9rem_auto] lg:items-end">
                  <label className="block text-sm font-bold text-ink">
                    {t("brand")}
                    <select
                      value={discount.brand}
                      onChange={(event) => updateBrandDiscount(discount.id, "brand", event.target.value)}
                      className="mt-2 h-12 w-full rounded-2xl bg-white px-4 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/25"
                    >
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>{getBrandName(brand.name)}</option>
                      ))}
                    </select>
                  </label>
                  <Field label={t("discountPercentage")} type="number" value={discount.percentage} onChange={(value) => updateBrandDiscount(discount.id, "percentage", value)} />
                  <Field label={t("discountLabel")} value={discount.labelAr ?? ""} onChange={(value) => updateBrandDiscount(discount.id, "labelAr", value)} />
                  <Field label={t("startDate")} type="date" value={discount.startDate ?? ""} onChange={(value) => updateBrandDiscount(discount.id, "startDate", value)} />
                  <Field label={t("endDate")} type="date" value={discount.endDate ?? ""} onChange={(value) => updateBrandDiscount(discount.id, "endDate", value)} />
                  <div className="flex items-center gap-2">
                    <Toggle label={t("enabled")} checked={discount.enabled} onChange={(value) => updateBrandDiscount(discount.id, "enabled", value)} />
                    <button
                      type="button"
                      onClick={() => removeBrandDiscount(discount.id)}
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

          <div className="rounded-2xl bg-ivory p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-extrabold text-ink">{t("productDiscounts")}</p>
              <Button type="button" size="sm" variant="outline" onClick={addProductDiscount}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t("addProductDiscount")}
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {settings.discounts.products.map((discount) => (
                <div key={discount.id} className="grid gap-3 rounded-2xl bg-white p-3 lg:grid-cols-[1.5fr_8rem_1fr_9rem_9rem_auto] lg:items-end">
                  <label className="block text-sm font-bold text-ink">
                    {t("products")}
                    <select
                      value={discount.productId}
                      onChange={(event) => updateProductDiscount(discount.id, "productId", event.target.value)}
                      className="mt-2 h-12 w-full rounded-2xl bg-white px-4 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/25"
                    >
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {getProductName(product, language)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field label={t("discountPercentage")} type="number" value={discount.percentage} onChange={(value) => updateProductDiscount(discount.id, "percentage", value)} />
                  <Field label={t("discountLabel")} value={discount.labelAr ?? ""} onChange={(value) => updateProductDiscount(discount.id, "labelAr", value)} />
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

      <div className="flex justify-end">
        <Button onClick={save}>{t("save")}</Button>
      </div>
    </div>
  );
}
