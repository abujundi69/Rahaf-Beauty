import { Banknote, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import CartSummary from "../components/CartSummary.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useOrders } from "../context/OrdersContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { formatPrice, getProductName } from "../utils/catalog.js";
import { formatNumber } from "../utils/format.js";
import { useStore } from "../utils/store.jsx";
import { getColorName, getSizeLabel } from "../utils/variants.js";

const phonePattern = /^\d{10}$/;

function normalizePhoneInput(value) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function Field({
  label,
  value,
  onChange,
  required = false,
  as = "input",
  inputMode,
  maxLength,
}) {
  const Component = as;
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <Component
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        inputMode={inputMode}
        maxLength={maxLength}
        className="mt-2 w-full rounded-2xl bg-ivory px-4 py-3 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/25"
      />
    </label>
  );
}

export default function Checkout() {
  const { accountSettings } = useAuth();
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { addOrder } = useOrders();
  const {
    cartDetailed,
    cartSubtotal,
    cartDiscountTotal,
    cartTotal,
    clearCart,
  } = useStore();
  const [form, setForm] = useState({
    fullName: accountSettings.fullName ?? "",
    phone: accountSettings.phone ?? "",
    city: accountSettings.city ?? "",
    area: accountSettings.area ?? "",
    street: accountSettings.street ?? "",
    building: accountSettings.building ?? "",
    notes: accountSettings.notes ?? "",
  });
  const [errors, setErrors] = useState({});

  const update = (key, value) => {
    setErrors((current) => ({ ...current, [key]: "" }));
    setForm((current) => ({
      ...current,
      [key]: key === "phone" ? normalizePhoneInput(value) : value,
    }));
  };

  const validate = () => {
    const requiredFields = ["fullName", "phone", "city", "area", "street"];
    const nextErrors = {};

    requiredFields.forEach((field) => {
      if (!String(form[field] ?? "").trim()) {
        nextErrors[field] = t("fieldRequired");
      }
    });
    if (form.phone && !phonePattern.test(form.phone)) {
      nextErrors.phone = t("phoneInvalid");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const placeOrder = async () => {
    if (cartDetailed.length === 0 || !validate()) return;

    const result = await addOrder({
      deliveryAddress: form,
    });

    if (!result.ok) {
      showToast({ type: "error", message: result.message || t("unexpectedError") });
      return;
    }

    await clearCart();
    showToast({ message: t("orderPlaced") });
    navigate(`/account/orders/${result.order.id}`);
  };

  return (
    <section className="container-page py-10 md:py-14">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          {t("checkoutPage")}
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-ink">
          {t("paymentOnDelivery")}
        </h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-shell text-ink">
                <Banknote className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold text-ink">
                  {t("paymentMethod")}
                </h2>
                <p className="mt-1 text-sm font-bold text-muted">
                  {t("paymentOnDelivery")}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-ink">{t("customerDetails")}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <Field label={t("fullName")} value={form.fullName} onChange={(value) => update("fullName", value)} required />
                {errors.fullName ? <p className="mt-2 text-xs font-bold text-sale">{errors.fullName}</p> : null}
              </div>
              <div>
                <Field
                  label={t("phoneNumber")}
                  value={form.phone}
                  onChange={(value) => update("phone", value)}
                  inputMode="numeric"
                  maxLength={10}
                  required
                />
                {errors.phone ? <p className="mt-2 text-xs font-bold text-sale">{errors.phone}</p> : null}
              </div>
              <div>
                <Field label={t("city")} value={form.city} onChange={(value) => update("city", value)} required />
                {errors.city ? <p className="mt-2 text-xs font-bold text-sale">{errors.city}</p> : null}
              </div>
              <div>
                <Field label={t("area")} value={form.area} onChange={(value) => update("area", value)} required />
                {errors.area ? <p className="mt-2 text-xs font-bold text-sale">{errors.area}</p> : null}
              </div>
              <div className="md:col-span-2">
                <Field label={t("street")} value={form.street} onChange={(value) => update("street", value)} required />
                {errors.street ? <p className="mt-2 text-xs font-bold text-sale">{errors.street}</p> : null}
              </div>
              <div className="md:col-span-2">
                <Field label={t("building")} value={form.building} onChange={(value) => update("building", value)} />
              </div>
              <div className="md:col-span-2">
                <Field label={t("notes")} value={form.notes} onChange={(value) => update("notes", value)} as="textarea" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-ink">{t("products")}</h2>
            <div className="mt-4 space-y-3">
              {cartDetailed.map((item) => (
                <div key={item.id} className="rounded-2xl bg-ivory p-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="font-bold text-ink">
                      {getProductName(item.product, language)}
                    </span>
                    <span className="text-muted">x{formatNumber(item.quantity)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-muted">
                    {item.selectedColor ? (
                      <span>{t("color")}: {getColorName(item.selectedColor, language)}</span>
                    ) : null}
                    {item.selectedSize ? (
                      <span>{t("size")}: {getSizeLabel(item.selectedSize)}</span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-extrabold text-ink">
                      {formatPrice(item.unitPrice, language)}
                    </span>
                    {item.originalUnitPrice > item.unitPrice ? (
                      <span className="text-xs font-semibold text-muted line-through">
                        {formatPrice(item.originalUnitPrice, language)}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button disabled={cartDetailed.length === 0} onClick={placeOrder}>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {t("placeOrder")}
              </Button>
              <Button as={Link} to="/cart" variant="outline">
                {t("cart")}
              </Button>
            </div>
          </section>
        </div>
        <CartSummary
          subtotal={cartSubtotal}
          discountTotal={cartDiscountTotal}
          total={cartTotal}
          showCheckoutButton={false}
        />
      </div>
    </section>
  );
}
