import { httpClient } from "./httpClient.js";
import { extractItems, normalizeOrderStatus } from "./normalizers.js";

function normalizeNotification(notification) {
  return {
    id: String(notification.id),
    type: notification.type,
    title: notification.title ?? "",
    message: notification.message ?? "",
    orderId: notification.orderId ? String(notification.orderId) : "",
    orderNumber: notification.orderNumber ?? "",
    customerName: notification.customerName ?? "",
    total: notification.total ?? null,
    orderStatus: normalizeOrderStatus(notification.orderStatus),
    read: Boolean(notification.isRead),
    isRead: Boolean(notification.isRead),
    createdAt: notification.createdAt,
  };
}

export const notificationsApi = {
  async list(params = {}) {
    const result = await httpClient.get("/admin/notifications", { params });
    return extractItems(result).map(normalizeNotification);
  },

  markRead(id) {
    return httpClient.put(`/admin/notifications/${id}/read`);
  },

  markAllRead() {
    return httpClient.put("/admin/notifications/read-all");
  },
};
