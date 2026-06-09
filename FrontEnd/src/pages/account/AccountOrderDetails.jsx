import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ordersApi } from "../../api/ordersApi.js";
import { toArabicError } from "../../api/httpClient.js";
import Button from "../../components/Button.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useOrders } from "../../context/OrdersContext.jsx";
import { formatPrice } from "../../utils/catalog.js";
import { formatDate, formatNumber } from "../../utils/format.js";
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  orderStatusSteps,
  orderStatusTone,
  translateOrderStatus,
} from "../../utils/status.js";
import { getColorName, getSizeLabel } from "../../utils/variants.js";

export default function AccountOrderDetails() {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState(() => getOrderById(id));
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    ordersApi
      .get(id)
      .then((result) => {
        if (active) {
          setOrder(result);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(toArabicError(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (!order) {
    return (
      <section className="beauty-shell p-8 text-center">
        <h2 className="font-display text-3xl font-bold text-ink">
          {loading ? t("loading") : t("orderDetails")}
        </h2>
        {error ? <p className="mt-3 text-sm font-bold text-sale">{error}</p> : null}
        <Button as={Link} to="/account/orders" className="mt-6">
          {t("ordersPage")}
        </Button>
      </section>
    );
  }

  const activeStepIndex = orderStatusSteps.indexOf(order.status);

  return (
    <section className="beauty-shell p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
            {t("orderDetails")}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink">{order.id}</h2>
          <p className="mt-2 text-sm text-muted">{formatDate(order.date)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${orderStatusTone[order.status]}`}>
          {translateOrderStatus(order.status, t)}
        </span>
      </div>

      <div className="mt-6 rounded-[1.2rem] border border-petal/60 bg-ivory/80 p-4">
        <p className="text-sm font-extrabold text-ink">{t("statusTimeline")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {orderStatusSteps.map((status, index) => {
            const reached = activeStepIndex >= index;
            return (
              <div
                key={status}
                className={`rounded-2xl border p-3 text-xs font-bold ${
                  reached ? "border-terracotta bg-white text-ink shadow-sm" : "border-petal bg-white/60 text-muted"
                }`}
              >
                {translateOrderStatus(status, t)}
              </div>
            );
          })}
        </div>
        {order.status === "rejected" ? (
          <p className="mt-3 rounded-2xl bg-sale/10 px-4 py-3 text-sm font-bold text-sale">
            {translateOrderStatus("rejected", t)}
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[1.2rem] border border-petal/60 bg-ivory/80 p-4">
          <p className="text-sm font-extrabold text-ink">{t("deliveryAddress")}</p>
          <div className="mt-3 text-sm leading-7 text-muted">
            <p className="font-bold text-ink">{order.deliveryAddress?.fullName}</p>
            <p>{order.deliveryAddress?.phone}</p>
            <p>{order.deliveryAddress?.address}</p>
            <p>
              {order.deliveryAddress?.city}, {order.deliveryAddress?.area}
            </p>
            <p>{order.deliveryAddress?.street}</p>
            {order.deliveryAddress?.notes ? <p>{order.deliveryAddress.notes}</p> : null}
          </div>
        </section>
        <section className="rounded-[1.2rem] border border-petal/60 bg-ivory/80 p-4">
          <p className="text-sm font-extrabold text-ink">{t("paymentMethod")}</p>
          <div className="mt-3 text-sm leading-7 text-muted">
            <p>{getPaymentMethodLabel(order.paymentMethod, t)}</p>
            <p>{getPaymentStatusLabel(order.paymentStatus, t)}</p>
          </div>
        </section>
      </div>

      <div className="mt-6 space-y-3">
        {order.items.map((item) => (
          <div key={item.id ?? item.name} className="rounded-2xl border border-petal/50 bg-ivory/80 p-4">
            <div className="flex justify-between gap-4">
              <span className="font-bold text-ink">
                {language === "ar" ? item.nameAr || item.name : item.nameEn || item.name}
              </span>
              <span className="text-sm font-semibold text-muted">
                {formatNumber(item.quantity)} x {formatPrice(item.unitPrice ?? item.price, language)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-muted">
              {item.selectedColor ? (
                <span>{t("color")}: {getColorName(item.selectedColor, language)}</span>
              ) : null}
              {item.selectedSize ? <span>{t("size")}: {getSizeLabel(item.selectedSize)}</span> : null}
              {item.discountPercent ? <span>{`خصم ${item.discountPercent}%`}</span> : null}
            </div>
            {item.originalUnitPrice > item.unitPrice ? (
              <p className="mt-2 text-xs font-semibold text-muted line-through">
                {formatPrice(item.originalUnitPrice, language)}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl bg-gradient-to-r from-charcoal to-terracotta p-4 text-white shadow-card">
        <div className="flex justify-between text-sm">
          <span>{t("subtotal")}</span>
          <span>{formatPrice(order.subtotal ?? order.total, language)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>{t("shipping")}</span>
          <span>{formatPrice(order.shipping ?? 0, language)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>{t("estimatedTax")}</span>
          <span>{formatPrice(order.tax ?? 0, language)}</span>
        </div>
        <div className="h-px bg-white/20" />
        <div className="flex justify-between text-base font-extrabold">
          <span>{t("total")}</span>
          <span>{formatPrice(order.total, language)}</span>
        </div>
      </div>
    </section>
  );
}
