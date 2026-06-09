import { LogIn, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";
import Button from "./Button.jsx";

export default function AuthRequiredModal({ open, onClose }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  if (!open) return null;

  const goToLogin = () => {
    onClose();
    navigate("/login", { state: { from: location } });
  };

  return (
    <div className="fixed inset-0 z-[150] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        aria-label={t("cancel")}
        onClick={onClose}
      />
      <section
        className="relative w-full max-w-md rounded-[1.5rem] border border-petal bg-white p-6 text-center shadow-soft md:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-required-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute end-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-shell text-muted transition hover:bg-petal hover:text-terracotta"
          aria-label={t("cancel")}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-shell text-terracotta ring-1 ring-petal/70">
          <LogIn className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 id="auth-required-title" className="mt-5 font-display text-3xl font-bold text-ink">
          {t("loginRequiredTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
          {t("loginRequiredMessage")}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button type="button" onClick={goToLogin}>
            {t("login")}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
        </div>
      </section>
    </div>
  );
}
