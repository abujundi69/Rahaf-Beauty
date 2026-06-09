import {
  Boxes,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingBag,
  Store,
  Tags,
  Users,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { cn } from "../../utils/cn.js";
import BrandMark from "../BrandMark.jsx";

export default function AdminSidebar({ onNavigate, className = "" }) {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: "/admin", label: t("dashboard"), icon: LayoutDashboard, end: true },
    { to: "/admin/products", label: t("manageProducts"), icon: Boxes },
    { to: "/admin/categories", label: t("manageCategories"), icon: FolderTree },
    { to: "/admin/brands", label: t("brands"), icon: Tags },
    { to: "/admin/orders", label: t("ordersManagement"), icon: ShoppingBag },
    { to: "/admin/customers", label: t("customersManagement"), icon: Users },
    { to: "/admin/settings", label: t("storeSettings"), icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    onNavigate?.();
    navigate("/", { replace: true });
  };

  return (
    <aside className={cn("beauty-sidebar rounded-[1.35rem] p-3", className)}>
      <div className="px-3 py-4">
        <BrandMark logoSize="sidebar" textClassName="text-sm text-white" />
        <span className="mt-2 block text-xs font-bold uppercase tracking-[0.18em] text-white/60">
          لوحة الإدارة
        </span>
      </div>
      <div className="grid gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  isActive ? "bg-white text-terracotta shadow-sm" : "text-white/80 hover:bg-white/20 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {link.label}
            </NavLink>
          );
        })}
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white/80 transition hover:bg-white/20 hover:text-white"
        >
          <Store className="h-4 w-4" aria-hidden="true" />
          {t("backToStore")}
        </Link>
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
