import {
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  X,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useStore } from "../../utils/store.jsx";
import { formatNumber } from "../../utils/format.js";
import BrandMark from "../BrandMark.jsx";

function DrawerLink({ to, icon: Icon, children, onClick, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-extrabold transition ${
          isActive
            ? "bg-white text-terracotta shadow-sm"
            : "text-white/90 hover:bg-white/20 hover:text-white"
        }`
      }
    >
      {Icon ? (
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : null}
      <span>{children}</span>
    </NavLink>
  );
}

export default function MobileMenu({ open, onClose, navLinks }) {
  const { isAuthenticated, isAdmin, isCustomer, logout } = useAuth();
  const { cartCount, wishlistCount } = useStore();
  const { isRtl, t } = useLanguage();
  const navigate = useNavigate();

  // منع سكرول الصفحة عند فتح القائمة
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate("/", { replace: true });
  };

  return (
    <div className="fixed inset-0 z-[120] lg:hidden">
      {/* الخلفية المغبشة */}
      <button
        type="button"
        onClick={onClose}
        aria-label={t("closeMenu")}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />

      {/* القائمة */}
      <aside
        className={`absolute top-0 ${
          isRtl ? "right-0" : "left-0"
        } beauty-sidebar h-screen w-[min(90vw,23rem)] flex flex-col overflow-y-auto overscroll-contain p-4`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <Link
            to="/"
            onClick={onClose}
            className="min-w-0"
            aria-label="العودة إلى RAHAF BEAUTY"
          >
            <BrandMark
              logoSize="drawer"
              textClassName="text-base text-white"
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/25 transition hover:bg-white/25"
            aria-label={t("closeMenu")}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="grid gap-2" aria-label={t("menu")}>
          {navLinks.map((link) => (
            <DrawerLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
            >
              {link.label}
            </DrawerLink>
          ))}
        </nav>

        <div className="mt-6 border-t border-white/20 pt-5">
          <div className="grid gap-2">
            {isCustomer && (
              <>
                <DrawerLink
                  to="/cart"
                  icon={ShoppingBag}
                  onClick={onClose}
                >
                  {t("cart")} ({formatNumber(cartCount)})
                </DrawerLink>

                <DrawerLink
                  to="/wishlist"
                  icon={Heart}
                  onClick={onClose}
                >
                  {t("wishlist")} ({formatNumber(wishlistCount)})
                </DrawerLink>
              </>
            )}

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <>
                    <DrawerLink
                      to="/admin"
                      icon={LayoutDashboard}
                      onClick={onClose}
                    >
                      {t("adminDashboard")}
                    </DrawerLink>

                    <DrawerLink
                      to="/admin/products"
                      icon={Package}
                      onClick={onClose}
                    >
                      {t("manageProducts")}
                    </DrawerLink>

                    <DrawerLink
                      to="/admin/categories"
                      icon={Package}
                      onClick={onClose}
                    >
                      {t("manageCategories")}
                    </DrawerLink>

                    <DrawerLink
                      to="/admin/brands"
                      icon={Package}
                      onClick={onClose}
                    >
                      {t("brands")}
                    </DrawerLink>

                    <DrawerLink
                      to="/admin/orders"
                      icon={ShoppingBag}
                      onClick={onClose}
                    >
                      {t("ordersManagement")}
                    </DrawerLink>

                    <DrawerLink
                      to="/admin/settings"
                      icon={Settings}
                      onClick={onClose}
                    >
                      {t("storeSettings")}
                    </DrawerLink>
                  </>
                ) : (
                  <>
                    <DrawerLink
                      to="/account/profile"
                      icon={Settings}
                      onClick={onClose}
                    >
                      {t("accountSettings")}
                    </DrawerLink>

                    <DrawerLink
                      to="/account/orders"
                      icon={Package}
                      onClick={onClose}
                    >
                      {t("myOrders")}
                    </DrawerLink>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-start text-sm font-extrabold text-white/90 transition hover:bg-white/20 hover:text-white"
                >
                  <LogOut
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  {t("logout")}
                </button>
              </>
            ) : (
              <DrawerLink
                to="/login"
                icon={LogIn}
                onClick={onClose}
              >
                {t("login")}
              </DrawerLink>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
