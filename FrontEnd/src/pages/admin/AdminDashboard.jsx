import { Boxes, DollarSign, FolderTree, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi.js";
import { Link } from "react-router-dom";
import Button from "../../components/Button.jsx";
import { useAdminNotifications } from "../../context/AdminNotificationsContext.jsx";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useOrders } from "../../context/OrdersContext.jsx";
import { formatPrice } from "../../utils/catalog.js";
import { formatNumber } from "../../utils/format.js";
import { orderStatusTone, translateOrderStatus } from "../../utils/status.js";

export default function AdminDashboard() {
  const { products, categories } = useCatalog();
  const { allOrders } = useOrders();
  const { notifications } = useAdminNotifications();
  const { language, t } = useLanguage();
  const [customersCount, setCustomersCount] = useState(0);
  const revenue = allOrders.reduce((total, order) => total + order.total, 0);
  const cards = [
    { label: t("totalProducts"), value: formatNumber(products.length), icon: Boxes },
    { label: t("totalCategories"), value: formatNumber(categories.length), icon: FolderTree },
    { label: t("totalOrders"), value: formatNumber(allOrders.length), icon: ShoppingBag },
    { label: t("totalCustomers"), value: formatNumber(customersCount), icon: ShoppingBag },
    { label: t("totalRevenue"), value: formatPrice(revenue, language), icon: DollarSign },
  ];

  useEffect(() => {
    let active = true;
    adminApi
      .listCustomers()
      .then((customers) => {
        if (active) setCustomersCount(customers.length);
      })
      .catch(() => {
        if (active) setCustomersCount(0);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="rounded-[1.35rem] border border-petal/70 bg-white/95 p-5 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-shell text-terracotta ring-1 ring-petal/70">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-5 text-sm font-bold text-muted">{card.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-ink">{card.value}</p>
            </article>
          );
        })}
      </div>

      <section className="rounded-[1.35rem] border border-petal/70 bg-white/95 p-6 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          {t("overview")}
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink">
          أديري الواجهة بثقة
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          أضيفي المنتجات وعدلي التصنيفات وتابعي الطلبات وسيظهر كل تغيير مباشرة في المتجر.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button as={Link} to="/admin/products/new">
            {t("addProduct")}
          </Button>
          <Button as={Link} to="/admin/categories/new" variant="outline">
            {t("addCategory")}
          </Button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[1.35rem] border border-petal/70 bg-white/95 p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
            {t("recentOrders")}
          </p>
          <div className="mt-4 space-y-3">
            {allOrders.slice(0, 4).map((order) => (
              <article key={order.id} className="rounded-2xl bg-ivory/80 p-4 ring-1 ring-petal/50">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-extrabold text-ink">{order.id}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${orderStatusTone[order.status]}`}>
                    {translateOrderStatus(order.status, t)}
                  </span>
                </div>
                <div className="mt-3 flex justify-between text-sm text-muted">
                  <span>{order.customerName}</span>
                  <span className="font-bold text-ink">{formatPrice(order.total, language)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-petal/70 bg-white/95 p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
            {t("notifications")}
          </p>
          <div className="mt-4 space-y-3">
            {notifications.slice(0, 4).map((notification) => (
              <article key={notification.id} className="rounded-2xl bg-ivory/80 p-4 ring-1 ring-petal/50">
                <div>
                  <p className="font-extrabold text-ink">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-terracotta">
                    {notification.orderNumber}
                  </p>
                </div>
              </article>
            ))}
            {notifications.length === 0 ? (
              <p className="text-sm text-muted">{t("emptyNotifications")}</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
