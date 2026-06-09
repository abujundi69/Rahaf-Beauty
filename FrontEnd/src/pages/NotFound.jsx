import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo.jsx";
import Button from "../components/Button.jsx";
import { BRAND_NAME } from "../config/brand.js";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <section className="container-page py-20 text-center">
      <BrandLogo size="drawer" className="mx-auto rounded-2xl bg-white p-1 shadow-sm" />
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
        {BRAND_NAME}
      </p>
      <h1 className="mt-3 font-display text-5xl font-bold text-ink">{t("pageNotFound")}</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted">
        {t("missingPageText")}
      </p>
      <Button as={Link} to="/shop" className="mt-7">
        {t("shop")}
      </Button>
    </section>
  );
}
