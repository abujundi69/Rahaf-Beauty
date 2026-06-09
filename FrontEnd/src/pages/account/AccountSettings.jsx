import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import ProductCard from "../../components/ProductCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useOrders } from "../../context/OrdersContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { formatPrice } from "../../utils/catalog.js";
import { formatDate } from "../../utils/format.js";
import { useStore } from "../../utils/store.jsx";
import { orderStatusTone, translateOrderStatus } from "../../utils/status.js";

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-full bg-ivory px-4 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/70"
      />
    </label>
  );
}

export default function AccountSettings() {
  const { accountSettings, deleteCurrentCustomer, updateAccountSettings, user } = useAuth();
  const { wishlistProducts } = useStore();
  const { orders } = useOrders();
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState(accountSettings);
  const [saved, setSaved] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(accountSettings);
    setSaved(false);
  }, [accountSettings]);

  const update = (key, value) => {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setError("");
    const result = await updateAccountSettings({ ...form, preferredLanguage: "ar" });
    setSaving(false);
    if (!result.ok) {
      setError(result.message || t("unexpectedError"));
      return;
    }
    setSaved(true);
  };

  const confirmDeleteAccount = async () => {
    if (!user?.id) return;

    const result = await deleteCurrentCustomer();

    if (result.ok) {
      setDeleteModalOpen(false);
      showToast({ message: t("accountDeleted") });
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="space-y-6">
      <section className="beauty-shell min-w-0 p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
              {t("profileInformation")}
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink">
              {t("accountSettings")}
            </h2>
          </div>
          {saved ? (
            <span className="rounded-full bg-olive/10 px-3 py-1 text-xs font-bold text-olive">
              {t("settingsSaved")}
            </span>
          ) : null}
          {error ? (
            <span className="rounded-full bg-sale/10 px-3 py-1 text-xs font-bold text-sale">
              {error}
            </span>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("fullName")} value={form.fullName} onChange={(value) => update("fullName", value)} />
          <Field label={t("phoneNumber")} value={form.phone} onChange={(value) => update("phone", value)} />
        </div>
      </section>

      <section className="beauty-shell min-w-0 p-5 md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          {t("addressBook")}
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label={t("city")} value={form.city} onChange={(value) => update("city", value)} />
          <Field label={t("area")} value={form.area} onChange={(value) => update("area", value)} />
          <Field label={t("street")} value={form.street} onChange={(value) => update("street", value)} />
          <Field label={t("notes")} value={form.notes} onChange={(value) => update("notes", value)} />
        </div>
        <Button type="button" className="mt-6" onClick={save} disabled={saving}>
          {saving ? t("loading") : t("save")}
        </Button>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1fr]">
        <div className="beauty-shell min-w-0 p-5 md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
            {t("orderHistory")}
          </p>
          <div className="mt-4 space-y-3">
            {orders.slice(0, 2).map((order) => (
              <div key={order.id} className="rounded-2xl border border-petal/50 bg-ivory/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-extrabold text-ink">{order.id}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${orderStatusTone[order.status]}`}>
                    {translateOrderStatus(order.status, t)}
                  </span>
                </div>
                <div className="mt-3 flex justify-between text-sm text-muted">
                  <span>{formatDate(order.date)}</span>
                  <span className="font-bold text-ink">{formatPrice(order.total, language)}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 ? (
              <p className="text-sm text-muted">{t("emptyOrders")}</p>
            ) : null}
          </div>
        </div>

        <div className="beauty-shell min-w-0 p-5 md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
            {t("wishlist")}
          </p>
          {wishlistProducts.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {wishlistProducts.slice(0, 2).map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              لا توجد مفضلات بعد.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-[1.35rem] border border-sale/25 bg-white/95 p-5 shadow-card md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sale">
          {t("deleteAccount")}
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink">
          {t("deleteAccount")}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          {t("deleteAccountWarning")}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5 border-sale/40 text-sale hover:border-sale hover:bg-sale/10"
          onClick={() => setDeleteModalOpen(true)}
        >
          {t("deleteAccount")}
        </Button>
      </section>

      {deleteModalOpen ? (
        <div className="fixed inset-0 z-modal grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[1.5rem] border border-petal bg-white p-6 shadow-soft">
            <h3 className="font-display text-3xl font-bold text-ink">
              {t("deleteAccount")}
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              {t("deleteAccountQuestion")}
            </p>
            <p className="mt-3 rounded-2xl bg-sale/10 px-4 py-3 text-sm font-bold text-sale">
              {t("deleteAccountWarning")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                className="bg-sale text-white hover:bg-sale"
                onClick={confirmDeleteAccount}
              >
                {t("confirmDeleteAccount")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
