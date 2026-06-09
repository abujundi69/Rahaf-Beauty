import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useOrders } from "../../context/OrdersContext.jsx";
import { formatPrice } from "../../utils/catalog.js";
import { formatDate, formatNumber } from "../../utils/format.js";
import { orderStatusTone, translateOrderStatus } from "../../utils/status.js";

export default function AccountOrders() {
  const { language, t } = useLanguage();
  const { orders } = useOrders();

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
        {t("ordersPage")}
      </p>
      <h2 className="mt-2 font-display text-3xl font-bold text-ink">
        {t("orderHistory")}
      </h2>
      {orders.length === 0 ? (
        <p className="mt-5 text-sm text-muted">{t("emptyOrders")}</p>
      ) : (
        <div className="mt-5 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}`}
              className="grid gap-3 rounded-2xl bg-ivory p-4 transition hover:bg-petal md:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-ink">{order.id}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${orderStatusTone[order.status]}`}
                  >
                    {translateOrderStatus(order.status, t)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {formatDate(order.date)} - {formatNumber(order.itemsCount)} {t("items")}
                </p>
              </div>
              <span className="font-extrabold text-ink">
                {formatPrice(order.total, language)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
