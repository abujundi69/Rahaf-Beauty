import { LockKeyhole, Phone } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BRAND_NAME } from "../../config/brand.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import BrandLogo from "../BrandLogo.jsx";
import Button from "../Button.jsx";

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
    <form onSubmit={submit} className="rounded-2xl border border-petal/70 bg-white p-6 shadow-soft md:p-8">
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-petal bg-blush p-3">
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
        <label className="block text-sm font-bold text-ink">
          {t("phoneNumber")}
          <span className="relative mt-2 block">
            <Phone
              className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="text"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(normalizePhoneInput(event.target.value))}
              className="h-12 w-full rounded-2xl bg-ivory pe-4 ps-11 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/25"
              required
            />
          </span>
        </label>

        <label className="block text-sm font-bold text-ink">
          {t("password")}
          <span className="relative mt-2 block">
            <LockKeyhole
              className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-2xl bg-ivory pe-4 ps-11 text-sm text-ink outline-none transition focus:ring-4 focus:ring-shell/25"
              required
            />
          </span>
        </label>
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
