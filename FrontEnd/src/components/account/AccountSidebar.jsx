import { Heart, Home, LogOut, MapPin, Package, Settings, ShoppingBag } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function AccountSidebar() {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const links = [
    { to: "/account", label: t("accountOverview"), icon: Home, end: true },
    { to: "/account/profile", label: t("profile"), icon: Settings },
    { to: "/account/addresses", label: t("addresses"), icon: MapPin },
    { to: "/account/orders", label: t("ordersPage"), icon: Package },
    { to: "/account/wishlist", label: t("wishlist"), icon: Heart },
    { to: "/cart", label: t("cart"), icon: ShoppingBag, end: true },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="beauty-sidebar rounded-[1.35rem] p-3">
      <div className="grid gap-2">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  isActive ? "bg-white text-terracotta shadow-sm" : "text-white/80 hover:bg-white/20 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-start text-sm font-bold text-white/80 transition hover:bg-white/20 hover:text-white"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {t("logout")}
        </button>
      </div>
    </aside>
  );
}
