import { LockKeyhole, Phone, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BRAND_NAME } from "../../config/brand.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import BrandLogo from "../BrandLogo.jsx";
import Button from "../Button.jsx";

const phonePattern = /^\d{10}$/;
const blockedRedirectPrefixes = ["/admin", "/account", "/login", "/register"];

function normalizePhoneInput(value) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function Field({
  error,
  icon: Icon,
  label,
  onChange,
  type = "text",
  value,
  inputMode,
  maxLength,
}) {
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <span className="relative mt-2 block">
        <Icon
          className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          className="h-12 w-full rounded-full bg-ivory pe-4 ps-11 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/70"
        />
      </span>
      {error ? (
        <span className="mt-2 block text-xs font-semibold text-sale">{error}</span>
      ) : null}
    </label>
  );
}

export default function RegisterForm() {
  const { registerCustomer } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({
    fullName: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => {
    const nextValue = key === "phoneNumber" ? normalizePhoneInput(value) : value;
    setValues((current) => ({ ...current, [key]: nextValue }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!values.fullName.trim()) nextErrors.fullName = t("fullNameRequired");
    if (!values.phoneNumber.trim()) {
      nextErrors.phoneNumber = t("phoneRequired");
    } else if (!phonePattern.test(values.phoneNumber.trim())) {
      nextErrors.phoneNumber = t("phoneInvalid");
    }
    if (!values.password) nextErrors.password = t("passwordRequired");
    if (!values.confirmPassword) {
      nextErrors.confirmPassword = t("confirmPasswordRequired");
    } else if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = t("passwordMismatch");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const result = await registerCustomer({
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      password: values.password,
    });
    setSubmitting(false);

    if (!result.ok) {
      setErrors((current) => ({
        ...current,
        phoneNumber: result.message || t("phoneAlreadyExists"),
      }));
      return;
    }

    const from = location.state?.from;
    const requestedPath =
      from?.pathname &&
      from.pathname.startsWith("/") &&
      !from.pathname.startsWith("//") &&
      !blockedRedirectPrefixes.some((prefix) => from.pathname.startsWith(prefix))
        ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
        : "/";

    navigate(requestedPath, { replace: true });
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-[1.5rem] border border-petal/70 bg-white/95 p-6 shadow-soft md:p-8"
    >
      <div className="mb-6 flex items-center gap-4 rounded-[1.2rem] border border-petal bg-shell/70 p-3">
        <BrandLogo size="drawer" className="rounded-xl bg-white p-1 ring-1 ring-petal" />
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold tracking-wide text-ink">
            {BRAND_NAME}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink">
            {t("createAccount")}
          </h1>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <Field
          label={t("fullName")}
          icon={UserRound}
          value={values.fullName}
          onChange={(value) => update("fullName", value)}
          error={errors.fullName}
        />
        <Field
          label={t("phoneNumber")}
          icon={Phone}
          value={values.phoneNumber}
          inputMode="numeric"
          maxLength={10}
          onChange={(value) => update("phoneNumber", value)}
          error={errors.phoneNumber}
        />
        <Field
          label={t("password")}
          icon={LockKeyhole}
          type="password"
          value={values.password}
          onChange={(value) => update("password", value)}
          error={errors.password}
        />
        <Field
          label={t("confirmPassword")}
          icon={LockKeyhole}
          type="password"
          value={values.confirmPassword}
          onChange={(value) => update("confirmPassword", value)}
          error={errors.confirmPassword}
        />
      </div>

      <Button type="submit" className="mt-6 w-full" disabled={submitting}>
        {submitting ? t("loading") : t("register")}
      </Button>
      <Link
        to="/login"
        state={{ from: location.state?.from }}
        className="mt-5 block text-center text-sm font-extrabold text-ink underline decoration-terracotta/50 underline-offset-4 transition hover:text-clay"
      >
        {t("alreadyHaveAccount")}
      </Link>
    </form>
  );
}
