import { Heart, LayoutDashboard, LogIn, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { getCategoryName, getCategoryPath } from "../utils/catalog.js";
import { useStore } from "../utils/store.jsx";
import BrandMark from "./BrandMark.jsx";
import DesktopNav from "./header/DesktopNav.jsx";
import HeaderIconLink from "./header/HeaderIconLink.jsx";
import HeaderSearch from "./header/HeaderSearch.jsx";
import MobileHeader from "./header/MobileHeader.jsx";
import MobileMenu from "./header/MobileMenu.jsx";
import UserMenu from "./header/UserMenu.jsx";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount, wishlistCount } = useStore();
  const { isAuthenticated, isAdmin } = useAuth();
  const { storefrontCategories: categories } = useCatalog();
  const { language, t } = useLanguage();

  const navLinks = useMemo(
    () => [
      { to: "/", label: t("home"), end: true },
      { to: "/shop", label: t("shop") },
      ...categories.slice(0, 6).map((category) => ({
        to: getCategoryPath(category.slug || category.id),
        label: getCategoryName(category, language),
      })),
    ],
    [categories, language, t],
  );

  return (
    <header className="sticky top-0 z-header border-b border-petal/70 bg-white/95 shadow-[0_14px_40px_rgba(190,24,93,0.11)] backdrop-blur-xl">
      <div className="container-wide">
        <div className="hidden grid-cols-[minmax(9.5rem,13rem)_minmax(28rem,1fr)_auto] items-center gap-5 py-4 lg:grid">
          <Link to="/" className="min-w-0 shrink-0" aria-label="العودة إلى RAHAF BEAUTY">
            <BrandMark logoSize="header" textClassName="text-lg" />
          </Link>

          <HeaderSearch className="min-w-0" />

          <div className="flex shrink-0 items-center justify-end gap-2">
            {!isAdmin ? (
              <>
                <HeaderIconLink to="/wishlist" icon={Heart} label={t("wishlist")} count={wishlistCount} />
                <HeaderIconLink to="/cart" icon={ShoppingBag} label={t("cart")} count={cartCount} />
              </>
            ) : null}
            {isAdmin ? (
              <Link
                to="/admin"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-charcoal to-terracotta px-5 text-sm font-extrabold text-white shadow-card transition hover:-translate-y-0.5 hover:from-terracotta hover:to-clay focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                {t("adminDashboard")}
              </Link>
            ) : null}
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Link
                to="/login"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-clay to-terracotta px-5 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(219,39,119,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(219,39,119,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                {t("login")}
              </Link>
            )}
          </div>
        </div>

        <MobileHeader onOpenMenu={() => setMobileOpen(true)} />
      </div>

      <DesktopNav links={navLinks} />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} navLinks={navLinks} />
    </header>
  );
}
