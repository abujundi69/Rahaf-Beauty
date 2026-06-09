import { useEffect, useState } from "react";
import Button from "../../components/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

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

export default function AccountProfile() {
  const { accountSettings, updateAccountSettings } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [form, setForm] = useState(accountSettings);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    setForm(accountSettings);
  }, [accountSettings]);

  const save = async () => {
    setSaving(true);
    setError("");
    const result = await updateAccountSettings({ ...form, preferredLanguage: "ar" });
    setSaving(false);
    if (!result.ok) {
      setError(result.message || t("unexpectedError"));
      return;
    }
    showToast({ message: t("settingsUpdated") });
  };

  return (
    <section className="beauty-shell p-5 md:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
        {t("profileInformation")}
      </p>
      <h2 className="mt-2 font-display text-3xl font-bold text-ink">{t("profile")}</h2>
      {error ? <p className="mt-4 rounded-2xl bg-sale/10 px-4 py-3 text-sm font-bold text-sale">{error}</p> : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label={t("fullName")} value={form.fullName} onChange={(value) => update("fullName", value)} />
        <Field label={t("phoneNumber")} value={form.phone} onChange={(value) => update("phone", value)} />
      </div>
      <Button className="mt-6" onClick={save} disabled={saving}>
        {saving ? t("loading") : t("save")}
      </Button>
    </section>
  );
}
