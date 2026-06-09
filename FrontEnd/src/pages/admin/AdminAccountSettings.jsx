import { useState } from "react";
import Button from "../../components/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-11 w-full rounded-full bg-ivory px-4 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/70"
      />
    </label>
  );
}

function Feedback({ result }) {
  if (!result) return null;
  return (
    <p className={`mt-3 text-sm font-bold ${result.ok ? "text-olive" : "text-sale"}`}>
      {result.msg}
    </p>
  );
}

export default function AdminAccountSettings() {
  const { user, updateUserInfo, changePassword, changeEmail } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState(user?.fullName ?? "");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameFeedback, setNameFeedback] = useState(null);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwFeedback, setPwFeedback] = useState(null);

  const [email, setEmail] = useState(user?.email ?? "");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState(null);

  const handleSaveName = async () => {
    setNameSaving(true);
    setNameFeedback(null);
    const result = await updateUserInfo({ fullName: name });
    setNameSaving(false);
    setNameFeedback({ ok: result.ok, msg: result.ok ? t("settingsSaved") : result.message });
  };

  const handleChangePassword = async () => {
    setPwSaving(true);
    setPwFeedback(null);
    const result = await changePassword(pwForm);
    setPwSaving(false);
    if (result.ok) {
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwFeedback({ ok: true, msg: t("settingsSaved") });
    } else {
      setPwFeedback({ ok: false, msg: result.message });
    }
  };

  const handleChangeEmail = async () => {
    setEmailSaving(true);
    setEmailFeedback(null);
    const result = await changeEmail({ newEmail: email });
    setEmailSaving(false);
    setEmailFeedback({ ok: result.ok, msg: result.ok ? t("settingsSaved") : result.message });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          {t("accountSettings")}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">
          {t("personalInfo")}
        </h1>
      </div>

      <section className="beauty-shell min-w-0 p-5 md:p-6">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          {t("personalInfo")}
        </p>
        <div className="max-w-sm">
          <Field label={t("fullName")} value={name} onChange={setName} />
        </div>
        <Feedback result={nameFeedback} />
        <Button type="button" className="mt-5" onClick={handleSaveName} disabled={nameSaving}>
          {nameSaving ? t("loading") : t("save")}
        </Button>
      </section>

      <section className="beauty-shell min-w-0 p-5 md:p-6">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          {t("changePassword")}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label={t("currentPassword")}
            type="password"
            value={pwForm.currentPassword}
            onChange={(v) => setPwForm((p) => ({ ...p, currentPassword: v }))}
          />
          <Field
            label={t("newPassword")}
            type="password"
            value={pwForm.newPassword}
            onChange={(v) => setPwForm((p) => ({ ...p, newPassword: v }))}
          />
          <Field
            label={t("confirmNewPassword")}
            type="password"
            value={pwForm.confirmPassword}
            onChange={(v) => setPwForm((p) => ({ ...p, confirmPassword: v }))}
          />
        </div>
        <Feedback result={pwFeedback} />
        <Button type="button" className="mt-5" onClick={handleChangePassword} disabled={pwSaving}>
          {pwSaving ? t("loading") : t("changePassword")}
        </Button>
      </section>

      <section className="beauty-shell min-w-0 p-5 md:p-6">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          {t("changeEmail")}
        </p>
        <div className="max-w-sm">
          <Field label={t("newEmail")} type="email" value={email} onChange={setEmail} />
        </div>
        <Feedback result={emailFeedback} />
        <Button type="button" className="mt-5" onClick={handleChangeEmail} disabled={emailSaving}>
          {emailSaving ? t("loading") : t("save")}
        </Button>
      </section>
    </div>
  );
}
