import { LockKeyhole, Phone } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BRAND_NAME } from "../../config/brand.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import BrandLogo from "../BrandLogo.jsx";
import Button from "../Button.jsx";
import AuthInput from "./AuthInput.jsx";

const phonePattern = /^\d{10}$/;
const blockedCustomerRedirectPrefixes = ["/admin", "/account", "/login", "/register"];

function normalizePhoneInput(value) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function getRedirectPath(role, requestedPath) {
  if (role === "admin") {
    return "/admin";
  }

  if (
    typeof requestedPath === "string" &&
    requestedPath.startsWith("/") &&
    !requestedPath.startsWith("//") &&
    !blockedCustomerRedirectPrefixes.some((prefix) => requestedPath.startsWith(prefix))
  ) {
    return requestedPath;
  }

  return "/";
}

export default function LoginForm() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!phonePattern.test(phoneNumber.trim())) {
      setError(t("phoneInvalid"));
      return;
    }

    setSubmitting(true);
    const result = await login(phoneNumber, password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message || t("invalidLogin"));
      return;
    }

    const requestedPath = location.state?.from?.pathname;
    navigate(getRedirectPath(result.user.role, requestedPath), { replace: true });
  };

  return (
    <form onSubmit={submit} className="rounded-[1.5rem] border border-petal/70 bg-white/95 p-6 shadow-soft md:p-8">
      <div className="mb-6 flex items-center gap-4 rounded-[1.2rem] border border-petal bg-shell/70 p-3">
        <BrandLogo size="drawer" className="rounded-xl bg-white p-1 ring-1 ring-petal" />
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold tracking-wide text-ink">
            {BRAND_NAME}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink">
            {t("login")}
          </h1>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl bg-sale/10 px-4 py-3 text-sm font-semibold text-sale">
          {error}
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        <AuthInput
          label={t("phoneNumber")}
          icon={Phone}
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          value={phoneNumber}
          onChange={(value) => setPhoneNumber(normalizePhoneInput(value))}
          required
        />
        <AuthInput
          label={t("password")}
          icon={LockKeyhole}
          type="password"
          value={password}
          onChange={(value) => setPassword(value)}
          required
        />
      </div>

      <Button type="submit" className="mt-6 w-full" disabled={submitting}>
        {submitting ? t("loading") : t("login")}
      </Button>
      <Link
        to="/register"
        state={{ from: location.state?.from }}
        className="mt-5 block text-center text-sm font-extrabold text-ink underline decoration-terracotta/50 underline-offset-4 transition hover:text-clay"
      >
        {t("dontHaveAccount")}
      </Link>
    </form>
  );
}
