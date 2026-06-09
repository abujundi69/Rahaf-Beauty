export const orderStatusTone = {
  under_review: "bg-shell text-charcoal",
  approved: "bg-petal/70 text-ink",
  rejected: "bg-sale/10 text-sale",
  preparing: "bg-terracotta/10 text-terracotta",
  shipping: "bg-ink/10 text-ink",
  out_for_delivery: "bg-olive/15 text-ink",
  delivered: "bg-olive/10 text-olive",
  received: "bg-olive/10 text-olive",
  cancelled: "bg-sale/10 text-sale",
  Pending: "bg-shell text-charcoal",
  Processing: "bg-terracotta/10 text-terracotta",
  Delivered: "bg-olive/10 text-olive",
  Cancelled: "bg-sale/10 text-sale",
};

export const productStatusTone = {
  Active: "bg-olive/10 text-olive",
  Draft: "bg-shell/30 text-terracotta",
  "Out of Stock": "bg-sale/10 text-sale",
};

export function translateOrderStatus(status, t) {
  const map = {
    Pending: "pending",
    Processing: "processing",
    Delivered: "delivered",
    Cancelled: "cancelled",
    under_review: "underReview",
    approved: "approved",
    rejected: "rejected",
    preparing: "preparing",
    shipping: "shippingStatus",
    out_for_delivery: "outForDelivery",
    delivered: "delivered",
    received: "received",
    cancelled: "cancelled",
  };
  return t(map[status] ?? status);
}

export const orderStatusTransitions = {
  under_review: ["approved", "cancelled"],
  approved: ["preparing", "shipping", "out_for_delivery", "cancelled"],
  preparing: ["shipping", "out_for_delivery", "cancelled"],
  shipping: ["out_for_delivery", "received"],
  out_for_delivery: ["received"],
};

export function getAllowedOrderTransitions(status) {
  return orderStatusTransitions[status] ?? [];
}

export function getOrderStatusActionLabel(status, t) {
  const map = {
    approved: "acceptOrder",
    preparing: "prepareOrder",
    shipping: "loadOrder",
    out_for_delivery: "shipOrder",
    received: "deliverOrder",
    cancelled: "cancelOrder",
  };

  return t(map[status] ?? status);
}

export const orderStatusSteps = [
  "under_review",
  "approved",
  "preparing",
  "shipping",
  "out_for_delivery",
  "received",
];

export function getPaymentMethodLabel(method, t) {
  return method === "cash_on_delivery" ? t("paymentOnDelivery") : method;
}

export function getPaymentStatusLabel(status, t) {
  const map = {
    pending_on_delivery: "pendingOnDelivery",
    paid_on_delivery: "paidOnDelivery",
  };
  return t(map[status] ?? status);
}

export function translateProductStatus(status, t) {
  const map = {
    Active: "active",
    Draft: "draft",
    "Out of Stock": "outOfStock",
  };
  return t(map[status] ?? status);
}
