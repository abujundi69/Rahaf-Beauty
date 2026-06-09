import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { notificationsApi } from "../api/notificationsApi.js";
import { toArabicError } from "../api/httpClient.js";
import { useAuth } from "./AuthContext.jsx";

const AdminNotificationsContext = createContext(null);

export function AdminNotificationsProvider({ children }) {
  const { isAdmin, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notificationsError, setNotificationsError] = useState("");

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) {
      setNotifications([]);
      return;
    }

    try {
      setNotifications(await notificationsApi.list({ page: 1, pageSize: 50 }));
      setNotificationsError("");
    } catch (error) {
      setNotifications([]);
      setNotificationsError(toArabicError(error));
    }
  }, [isAdmin, isAuthenticated]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = useCallback(
    async (notificationId) => {
      await notificationsApi.markRead(notificationId);
      await loadNotifications();
    },
    [loadNotifications],
  );

  const markAllAsRead = useCallback(async () => {
    await notificationsApi.markAllRead();
    await loadNotifications();
  }, [loadNotifications]);

  const value = useMemo(
    () => ({
      notifications,
      notificationsError,
      unreadCount: notifications.filter((notification) => !notification.read).length,
      refreshNotifications: loadNotifications,
      markAsRead,
      markAllAsRead,
    }),
    [
      loadNotifications,
      markAllAsRead,
      markAsRead,
      notifications,
      notificationsError,
    ],
  );

  return (
    <AdminNotificationsContext.Provider value={value}>
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications() {
  const context = useContext(AdminNotificationsContext);
  if (!context) {
    throw new Error(
      "useAdminNotifications must be used within AdminNotificationsProvider",
    );
  }
  return context;
}
