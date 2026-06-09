import { Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "../../api/ordersApi.js";
import { toArabicError } from "../../api/httpClient.js";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useOrders } from "../../context/OrdersContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { formatPrice } from "../../utils/catalog.js";
import { formatDate, formatNumber } from "../../utils/format.js";
import { useStore } from "../../utils/store.jsx";
import { orderStatusTone, translateOrderStatus } from "../../utils/status.js";

export default function AccountOrders() {
  const { language, t } = useLanguage();
  const { orders } = useOrders();
  const { refreshCart } = useStore();
  const { showToast } = useToast();
  const [reorderingId, setReorderingId] = useState("");

  const handleReorder = async (order) => {
    if (reorderingId) return;

    setReorderingId(order.id);
    try {
      const result = await ordersApi.reorder(order.id);
      await refreshCart();
      if (result.warnings.length > 0) {
        showToast({
          type: "warning",
          message: `${t("reorderPartial")} ${result.warnings[0]}`,
        });
      } else {
        showToast({ type: "success", message: t("reorderSuccess") });
      }
    } catch (requestError) {
      showToast({ type: "error", message: toArabicError(requestError) });
    } finally {
      setReorderingId("");
    }
  };

  return (
    <section className="beauty-shell p-5">
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
            <article
              key={order.id}
              className="grid gap-3 rounded-2xl border border-petal/50 bg-ivory/80 p-4 transition hover:bg-shell md:grid-cols-[1fr_auto] md:items-center"
            >
              <Link to={`/account/orders/${order.id}`} className="block min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-ink">{order.orderNumber ?? order.id}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${orderStatusTone[order.status]}`}
                  >
                    {translateOrderStatus(order.status, t)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {formatDate(order.date)} - {formatNumber(order.itemsCount)} {t("items")}
                </p>
              </Link>
              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <span className="font-extrabold text-ink">
                  {formatPrice(order.total, language)}
                </span>
                <button
                  type="button"
                  onClick={() => handleReorder(order)}
                  disabled={Boolean(reorderingId)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-clay/25 bg-white px-4 text-sm font-extrabold text-terracotta shadow-sm transition hover:-translate-y-0.5 hover:border-clay hover:bg-shell disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {reorderingId === order.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  )}
                  {t("reorder")}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
