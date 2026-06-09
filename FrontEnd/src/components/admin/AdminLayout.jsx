import { Bell, CheckCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { BRAND_NAME } from "../../config/brand.js";
import { useAdminNotifications } from "../../context/AdminNotificationsContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { formatPrice } from "../../utils/catalog.js";
import { formatDate, formatNumber } from "../../utils/format.js";
import { translateOrderStatus } from "../../utils/status.js";
import BrandMark from "../BrandMark.jsx";
import AdminSidebar from "./AdminSidebar.jsx";

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { isRtl, language, t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications();
  const navigate = useNavigate();

  const openNotification = (notification) => {
    markAsRead(notification.id);
    setNotificationsOpen(false);
    navigate(`/admin/orders?order=${notification.orderId}`);
  };

  return (
    <section className="container-wide py-10 md:py-14">
      <div className="mb-8 overflow-hidden rounded-[1.5rem] border border-petal/70 bg-white/95 p-6 shadow-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
              {t("adminDashboard")}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold text-ink">
              {`إدارة متجر ${BRAND_NAME}`}
            </h1>
            <p className="mt-2 text-sm text-muted">
              أديري المنتجات والتصنيفات والطلبات والإعدادات من بيانات المتجر الحقيقية.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                className="relative grid h-11 w-11 place-items-center rounded-2xl bg-shell text-terracotta ring-1 ring-petal/70 transition hover:bg-petal/70"
                aria-label={t("notifications")}
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadCount > 0 ? (
                  <span className="absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-sale px-1 text-[0.68rem] font-extrabold text-white">
                    {formatNumber(unreadCount)}
                  </span>
                ) : null}
              </button>
              {notificationsOpen ? (
                <div className={`absolute top-12 z-[100] w-[min(88vw,22rem)] rounded-[1.35rem] border border-petal bg-white/95 p-3 text-ink shadow-soft backdrop-blur ${isRtl ? "left-0" : "right-0"}`}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-extrabold text-ink">{t("notifications")}</p>
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="inline-flex items-center gap-1 rounded-full bg-shell px-3 py-1.5 text-xs font-bold text-terracotta hover:bg-petal/70"
                    >
                      <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      {t("markAllAsRead")}
                    </button>
                  </div>
                  <div className="max-h-80 space-y-2 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="rounded-2xl bg-shell p-4 text-sm font-semibold text-ink">
                        {t("emptyNotifications")}
                      </p>
                    ) : (
                      notifications.slice(0, 8).map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => openNotification(notification)}
                          className={`block w-full rounded-2xl p-4 text-start text-sm transition hover:bg-petal ${
                            notification.read ? "bg-ivory text-ink" : "bg-shell text-ink ring-1 ring-petal/70"
                          }`}
                        >
                          <span className="block font-extrabold">
                            {notification.title}
                          </span>
                          <span className="mt-2 block text-xs font-semibold text-secondary">
                            {notification.orderNumber} - {notification.customerName}
                          </span>
                          <span className="mt-1 block text-xs font-semibold text-secondary">
                            {formatPrice(notification.total, language)} - {translateOrderStatus(notification.orderStatus, t)}
                          </span>
                          <span className="mt-1 block text-xs font-semibold text-secondary">
                            {formatDate(notification.createdAt)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            <BrandMark logoSize="drawer" className="shrink-0" textClassName="text-base" />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-clay to-terracotta px-4 text-sm font-extrabold text-white shadow-card transition hover:-translate-y-0.5 lg:hidden"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
          {t("menu")}
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <AdminSidebar className="hidden lg:block" />
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-[120] lg:hidden">
          <button
            type="button"
            className="fixed inset-0 bg-ink/40"
            aria-label={t("closeMenu")}
            onClick={() => setMenuOpen(false)}
          />
          <div
            className={`fixed inset-y-0 ${
              isRtl ? "right-0" : "left-0"
            } w-[min(90vw,22rem)] overflow-y-auto bg-blush p-4 shadow-soft`}
          >
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink"
                aria-label={t("closeMenu")}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <AdminSidebar onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
