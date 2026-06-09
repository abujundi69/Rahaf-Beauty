import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import BrandMark from "../BrandMark.jsx";
import AccountSidebar from "./AccountSidebar.jsx";

export default function AccountLayout() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <section className="container-page py-10 md:py-14">
      <div className="mb-8 rounded-[1.5rem] border border-petal/70 bg-white/95 p-6 shadow-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
              {t("account")}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold text-ink">
              {user?.fullName}
            </h1>
            <p className="mt-2 text-sm text-muted">
              مساحة هادئة لإدارة بياناتك وطلباتك ومفضلاتك.
            </p>
          </div>
          <BrandMark logoSize="drawer" className="shrink-0" textClassName="text-base" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <AccountSidebar />

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </section>
  );
}
