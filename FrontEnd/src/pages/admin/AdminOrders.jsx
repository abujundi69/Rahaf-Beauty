import { Eye, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ordersApi } from "../../api/ordersApi.js";
import { toArabicError } from "../../api/httpClient.js";
import Button from "../../components/Button.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useOrders } from "../../context/OrdersContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { formatPrice } from "../../utils/catalog.js";
import { cn } from "../../utils/cn.js";
import { formatDate, formatNumber } from "../../utils/format.js";
import {
  getAllowedOrderTransitions,
  getOrderStatusActionLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  orderStatusTone,
  translateOrderStatus,
} from "../../utils/status.js";
import { getColorName, getSizeLabel } from "../../utils/variants.js";

const adminStatusNote = "تم تحديث الحالة من لوحة الإدارة";

function getShortOrderCode(order) {
  const code = order?.orderNumber || order?.id || "";
  if (!code) return "";
  return code.length > 16 ? `${code.slice(0, 8)}...` : code;
}

function StatusBadge({ status, t }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold",
        orderStatusTone[status] ?? orderStatusTone.under_review,
      )}
    >
      {translateOrderStatus(status, t)}
    </span>
  );
}

function DetailSection({ title, children, className = "" }) {
  return (
    <section className={cn("rounded-[1.15rem] border border-petal/70 bg-ivory/75 p-4", className)}>
      <h4 className="text-sm font-extrabold text-ink">{title}</h4>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function InfoLine({ label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-start justify-between gap-4 border-b border-petal/60 py-2 last:border-b-0">
      <span className="text-xs font-bold text-muted">{label}</span>
      <span className="text-start text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}

export default function AdminOrders() {
  const { language, t } = useLanguage();
  const { allOrders, ordersLoading, updateOrderStatus } = useOrders();
  const { showToast } = useToast();
  const [params, setParams] = useSearchParams();
  const [selectedOrderId, setSelectedOrderId] = useState(params.get("order"));
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState("");

  const visibleOrders = useMemo(() => allOrders, [allOrders]);
  const allowedStatuses = selectedOrder
    ? getAllowedOrderTransitions(selectedOrder.status)
    : [];

  useEffect(() => {
    setSelectedOrderId(params.get("order"));
  }, [params]);

  useEffect(() => {
    if (!selectedOrderId) return undefined;

    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [selectedOrderId]);

  useEffect(() => {
    let active = true;
    if (!selectedOrderId) {
      setSelectedOrder(null);
      setDetailsError("");
      setDetailsLoading(false);
      return () => {
        active = false;
      };
    }

    setSelectedOrder(null);
    setDetailsError("");
    setDetailsLoading(true);
    ordersApi
      .adminGet(selectedOrderId)
      .then((order) => {
        if (active) {
          setSelectedOrder(order);
          setDetailsError("");
        }
      })
      .catch((error) => {
        if (active) {
          setSelectedOrder(null);
          setDetailsError(toArabicError(error));
        }
      })
      .finally(() => {
        if (active) {
          setDetailsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedOrderId]);

  const openOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setParams({ order: orderId });
  };

  const closeOrder = () => {
    setSelectedOrderId(null);
    setSelectedOrder(null);
    setDetailsError("");
    setStatusUpdating("");
    setParams({});
  };

  const changeStatus = async (status) => {
    if (!selectedOrder || statusUpdating) return;

    setStatusUpdating(status);
    const result = await updateOrderStatus(selectedOrder.id, status, adminStatusNote);
    setStatusUpdating("");

    if (result.ok) {
      setSelectedOrder(result.order);
      showToast({ type: "success", message: t("statusUpdated") });
      return;
    }

    showToast({ type: "error", message: result.message || t("unexpectedError") });
  };

  return (
    <section className="beauty-shell min-w-0 p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
            {t("ordersManagement")}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink">{t("orders")}</h2>
        </div>
      </div>

      <div className="beauty-table-wrap max-w-full overflow-x-auto p-2">
        <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-2 text-start">{t("orderNumber")}</th>
              <th className="px-4 py-2 text-start">{t("customerName")}</th>
              <th className="px-4 py-2 text-start">{t("phoneNumber")}</th>
              <th className="px-4 py-2 text-start">{t("total")}</th>
              <th className="px-4 py-2 text-start">{t("status")}</th>
              <th className="px-4 py-2 text-start">{t("date")}</th>
              <th className="px-4 py-2 text-end">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {ordersLoading ? (
              <tr>
                <td colSpan={7} className="rounded-2xl bg-shell p-8 text-center text-sm font-bold text-muted">
                  {t("loading")}
                </td>
              </tr>
            ) : null}
            {!ordersLoading && visibleOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="rounded-2xl bg-shell p-8 text-center text-sm font-bold text-muted">
                  {t("emptyOrders")}
                </td>
              </tr>
            ) : null}
            {!ordersLoading
              ? visibleOrders.map((order) => (
                  <tr key={order.id} className="bg-white/95 transition hover:bg-shell/50">
                    <td className="rounded-s-2xl px-4 py-3 font-extrabold text-ink">
                      {getShortOrderCode(order)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink">{order.customerName}</td>
                    <td className="px-4 py-3 text-muted">{order.phone || order.customerPhone}</td>
                    <td className="px-4 py-3 font-bold text-ink">{formatPrice(order.total, language)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} t={t} />
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(order.date)}</td>
                    <td className="rounded-e-2xl px-4 py-3 text-end">
                      <button
                        type="button"
                        onClick={() => openOrder(order.id)}
                        className="inline-flex h-9 items-center gap-2 rounded-full bg-shell px-3 text-xs font-extrabold text-terracotta shadow-sm transition hover:bg-petal/80"
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        {t("viewDetails")}
                      </button>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      {selectedOrderId ? (
        <div className="fixed inset-0 z-[150] grid place-items-center bg-ink/50 p-3 backdrop-blur-sm sm:p-5">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label={t("close")}
            onClick={closeOrder}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-order-dialog-title"
            className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[1.5rem] border border-petal bg-white shadow-soft"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-petal/70 bg-gradient-to-r from-white via-ivory to-shell px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
                  {t("orderDetails")}
                </p>
                <h3 id="admin-order-dialog-title" className="mt-1 truncate font-display text-2xl font-bold text-ink sm:text-3xl">
                  {selectedOrder ? selectedOrder.orderNumber || selectedOrder.id : t("loading")}
                </h3>
                {selectedOrder ? (
                  <p className="mt-1 text-sm text-muted">{formatDate(selectedOrder.date)}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={closeOrder}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-terracotta shadow-sm ring-1 ring-petal/70 transition hover:bg-shell"
                aria-label={t("close")}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              {detailsLoading ? (
                <div className="grid min-h-64 place-items-center rounded-2xl bg-shell text-sm font-bold text-muted">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    {t("loading")}
                  </span>
                </div>
              ) : null}

              {!detailsLoading && detailsError ? (
                <div className="rounded-2xl bg-sale/10 px-4 py-3 text-sm font-bold text-sale">
                  {detailsError}
                </div>
              ) : null}

              {!detailsLoading && selectedOrder ? (
                <div className="grid gap-4">
                  <DetailSection title={t("orderStatusSection")}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="mb-2 text-xs font-bold text-muted">{t("currentStatus")}</p>
                        <StatusBadge status={selectedOrder.status} t={t} />
                      </div>
                      <div className="flex flex-wrap gap-2" aria-busy={Boolean(statusUpdating)}>
                        {allowedStatuses.length > 0 ? (
                          allowedStatuses.map((status) => (
                            <Button
                              key={status}
                              type="button"
                              size="sm"
                              variant={status === "cancelled" ? "outline" : "primary"}
                              disabled={Boolean(statusUpdating)}
                              onClick={() => changeStatus(status)}
                              className={status === "cancelled" ? "border-sale/40 text-sale hover:border-sale hover:bg-sale/10" : ""}
                            >
                              {statusUpdating === status ? (
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                              ) : null}
                              {getOrderStatusActionLabel(status, t)}
                            </Button>
                          ))
                        ) : (
                          <p className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-muted">
                            {t("noAvailableStatusActions")}
                          </p>
                        )}
                      </div>
                    </div>
                  </DetailSection>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <DetailSection title={t("customerDetails")}>
                      <div className="text-sm">
                        <InfoLine label={t("customerName")} value={selectedOrder.customerName} />
                        <InfoLine label={t("phoneNumber")} value={selectedOrder.phone || selectedOrder.customerPhone} />
                        {selectedOrder.customerDeleted ? (
                          <InfoLine label={t("status")} value={t("deletedCustomer")} />
                        ) : null}
                      </div>
                    </DetailSection>

                    <DetailSection title={t("paymentAndDelivery")}>
                      <div className="text-sm">
                        <InfoLine label={t("paymentMethod")} value={getPaymentMethodLabel(selectedOrder.paymentMethod, t)} />
                        <InfoLine label={t("status")} value={getPaymentStatusLabel(selectedOrder.paymentStatus, t)} />
                        <InfoLine label={t("city")} value={selectedOrder.deliveryAddress?.city} />
                        <InfoLine label={t("area")} value={selectedOrder.deliveryAddress?.area} />
                        <InfoLine label={t("street")} value={selectedOrder.deliveryAddress?.street} />
                        <InfoLine label={t("building")} value={selectedOrder.deliveryAddress?.building} />
                      </div>
                    </DetailSection>
                  </div>

                  <DetailSection title={t("orderedProducts")}>
                    <div className="grid gap-3">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id ?? item.name} className="rounded-2xl border border-petal/60 bg-white p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="font-extrabold text-ink">
                                {language === "ar" ? item.nameAr || item.name : item.nameEn || item.name}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-muted">
                                {item.selectedColor ? (
                                  <span>{t("color")}: {getColorName(item.selectedColor, language)}</span>
                                ) : null}
                                {item.selectedSize ? (
                                  <span>{t("size")}: {getSizeLabel(item.selectedSize)}</span>
                                ) : null}
                                {item.discountPercent ? <span>{`${t("discount")} ${item.discountPercent}%`}</span> : null}
                              </div>
                            </div>
                            <div className="shrink-0 text-start sm:text-end">
                              <p className="font-bold text-ink">
                                {formatNumber(item.quantity)} x {formatPrice(item.unitPrice ?? item.price, language)}
                              </p>
                              <p className="mt-1 text-sm font-extrabold text-terracotta">
                                {formatPrice(item.lineTotal || (item.unitPrice ?? item.price) * item.quantity, language)}
                              </p>
                              {item.originalUnitPrice > item.unitPrice ? (
                                <p className="mt-1 text-xs font-semibold text-muted line-through">
                                  {formatPrice(item.originalUnitPrice, language)}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DetailSection>

                  {selectedOrder.deliveryAddress?.notes ? (
                    <DetailSection title={t("orderNotes")}>
                      <p className="text-sm leading-7 text-ink">{selectedOrder.deliveryAddress.notes}</p>
                    </DetailSection>
                  ) : null}

                  <div className="grid gap-2 rounded-2xl bg-gradient-to-r from-charcoal to-terracotta p-4 text-sm text-white shadow-card">
                    <div className="flex justify-between gap-4">
                      <span>{t("subtotal")}</span>
                      <span>{formatPrice(selectedOrder.subtotal ?? selectedOrder.total, language)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>{t("shipping")}</span>
                      <span>{formatPrice(selectedOrder.shipping ?? 0, language)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>{t("discount")}</span>
                      <span>{formatPrice(selectedOrder.discountTotal ?? 0, language)}</span>
                    </div>
                    <div className="h-px bg-white/20" />
                    <div className="flex justify-between gap-4 text-base font-extrabold">
                      <span>{t("total")}</span>
                      <span>{formatPrice(selectedOrder.total, language)}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
