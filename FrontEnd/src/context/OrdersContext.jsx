import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ordersApi } from "../api/ordersApi.js";
import { toArabicError } from "../api/httpClient.js";
import { useAuth } from "./AuthContext.jsx";

const OrdersContext = createContext(null);

async function fetchAllAdminOrders() {
  const pageSize = 100;
  let page = 1;
  let totalPages = 1;
  const orders = [];

  do {
    const result = await ordersApi.adminList({ page, pageSize });
    orders.push(...(result.items ?? []));
    totalPages = Number(result.totalPages) || page;
    page += 1;
  } while (page <= totalPages);

  const byId = new Map();
  orders.forEach((order) => {
    if (order?.id && !byId.has(order.id)) {
      byId.set(order.id, order);
    }
  });

  return [...byId.values()];
}

export function OrdersProvider({ children }) {
  const { isAuthenticated, isCustomer, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      setAllOrders([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      if (isAdmin) {
        const result = await fetchAllAdminOrders();
        setAllOrders(result);
        setOrders([]);
      } else if (isCustomer) {
        const result = await ordersApi.my();
        setOrders(result);
        setAllOrders([]);
      }
    } catch (requestError) {
      setOrders([]);
      setAllOrders([]);
      setError(toArabicError(requestError));
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isAuthenticated, isCustomer]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const addOrder = useCallback(
    async ({ deliveryAddress }) => {
      if (!isAuthenticated || !isCustomer) {
        return { ok: false, reason: "auth" };
      }

      try {
        const order = await ordersApi.create({
          addressId: deliveryAddress.addressId || null,
          customerName: deliveryAddress.fullName,
          phone: deliveryAddress.phone,
          city: deliveryAddress.city,
          area: deliveryAddress.area,
          street: deliveryAddress.street,
          building: deliveryAddress.building || null,
          notes: deliveryAddress.notes || null,
        });
        setOrders((current) => [order, ...current]);
        return { ok: true, order };
      } catch (requestError) {
        return { ok: false, message: toArabicError(requestError), fields: requestError.fields ?? {} };
      }
    },
    [isAuthenticated, isCustomer],
  );

  const updateOrderStatus = useCallback(
    async (orderId, status, note = "") => {
      try {
        const order = await ordersApi.updateStatus(orderId, status, note);
        setAllOrders((current) =>
          current.map((item) => (item.id === order.id ? order : item)),
        );
        setOrders((current) =>
          current.map((item) => (item.id === order.id ? order : item)),
        );
        return { ok: true, order };
      } catch (requestError) {
        const message = toArabicError(requestError);
        setError(message);
        return { ok: false, message };
      }
    },
    [],
  );

  const getOrderById = useCallback(
    (id) => orders.find((order) => order.id === id || order.orderNumber === id) ?? null,
    [orders],
  );

  const getAnyOrderById = useCallback(
    (id) => allOrders.find((order) => order.id === id || order.orderNumber === id) ?? null,
    [allOrders],
  );

  const value = useMemo(
    () => ({
      orders,
      allOrders,
      ordersLoading: loading,
      ordersError: error,
      refreshOrders: loadOrders,
      addOrder,
      updateOrderStatus,
      getOrderById,
      getAnyOrderById,
    }),
    [
      addOrder,
      allOrders,
      error,
      getAnyOrderById,
      getOrderById,
      loadOrders,
      loading,
      orders,
      updateOrderStatus,
    ],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);

  if (!context) {
    throw new Error("useOrders must be used within OrdersProvider");
  }

  return context;
}
