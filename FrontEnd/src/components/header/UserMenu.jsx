import {
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { cn } from "../../utils/cn.js";

function MenuItem({ to, icon: Icon, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-muted transition hover:bg-ivory hover:text-ink"
    >
      <Icon className="h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
      <span>{children}</span>
    </Link>
  );
}

export default function UserMenu({ className = "" }) {
  const { user, isAdmin, logout } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const close = () => setOpen(false);
  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-sm ring-1 ring-petal/70 transition hover:bg-petal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        aria-label={t("userMenu")}
        aria-expanded={open}
        title={user?.fullName}
      >
        <UserRound className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
      </button>

      {open ? (
        <div className="absolute end-0 top-full z-[90] mt-3 w-60 max-w-[calc(100vw-2rem)] rounded-2xl border border-petal bg-white p-2 shadow-soft">
          <div className="border-b border-petal px-3 py-3">
            <p className="truncate text-sm font-extrabold text-ink">{user?.fullName}</p>
            <p className="mt-1 truncate text-xs font-semibold text-muted">{user?.phoneNumber}</p>
          </div>
          <div className="mt-2 grid gap-1">
            {isAdmin ? (
              <>
                <MenuItem to="/admin" icon={LayoutDashboard} onClick={close}>
                  {t("adminDashboard")}
                </MenuItem>
                <MenuItem to="/admin/products" icon={Package} onClick={close}>
                  {t("manageProducts")}
                </MenuItem>
                <MenuItem to="/admin/orders" icon={Package} onClick={close}>
                  {t("ordersManagement")}
                </MenuItem>
                <MenuItem to="/admin/settings" icon={Settings} onClick={close}>
                  {t("storeSettings")}
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem to="/account/profile" icon={Settings} onClick={close}>
                  {t("accountSettings")}
                </MenuItem>
                <MenuItem to="/account/orders" icon={Package} onClick={close}>
                  {t("myOrders")}
                </MenuItem>
                <MenuItem to="/wishlist" icon={Heart} onClick={close}>
                  {t("wishlist")}
                </MenuItem>
              </>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-start text-sm font-bold text-muted transition hover:bg-ivory hover:text-ink"
            >
              <LogOut className="h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
              <span>{t("logout")}</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
