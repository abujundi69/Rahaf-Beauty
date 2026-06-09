import { LayoutDashboard, LogIn, Menu, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useStore } from "../../utils/store.jsx";
import BrandMark from "../BrandMark.jsx";
import HeaderIconLink from "./HeaderIconLink.jsx";
import HeaderSearch from "./HeaderSearch.jsx";
import UserMenu from "./UserMenu.jsx";

export default function MobileHeader({ onOpenMenu }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const { cartCount } = useStore();
  const { t } = useLanguage();

  return (
    <div className="py-3 lg:hidden">
      <div className="flex items-center gap-2">
        <Link to="/" className="min-w-0 flex-1" aria-label="العودة إلى RAHAF BEAUTY">
          <BrandMark
            logoSize="mobile"
            className="max-w-full"
            textClassName="text-sm"
          />
        </Link>

        {isAuthenticated ? (
          <UserMenu />
        ) : (
          <HeaderIconLink to="/login" icon={LogIn} label={t("login")} />
        )}
        {isAdmin ? (
          <HeaderIconLink to="/admin" icon={LayoutDashboard} label={t("adminDashboard")} />
        ) : null}
        {!isAdmin ? (
          <HeaderIconLink to="/cart" icon={ShoppingBag} label={t("cart")} count={cartCount} />
        ) : null}
        <button
          type="button"
          onClick={onOpenMenu}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-ink shadow-sm ring-1 ring-petal/70"
          aria-label={t("menu")}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <HeaderSearch className="mt-3" />
    </div>
  );
}
