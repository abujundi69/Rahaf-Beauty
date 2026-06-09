import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { accountApi } from "../../api/accountApi.js";
import Button from "../../components/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useOrders } from "../../context/OrdersContext.jsx";
import { useStore } from "../../utils/store.jsx";
import { formatPrice } from "../../utils/catalog.js";
import { formatDate, formatNumber } from "../../utils/format.js";
import { orderStatusTone, translateOrderStatus } from "../../utils/status.js";

export default function AccountDashboard() {
  const { user, accountSettings } = useAuth();
  const { language, t } = useLanguage();
  const { orders } = useOrders();
  const { wishlistCount, cartCount } = useStore();
  const [addresses, setAddresses] = useState([]);
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];

  useEffect(() => {
    let active = true;
    accountApi
      .getAddresses()
      .then((result) => {
        if (active) setAddresses(result);
      })
      .catch(() => {
        if (active) setAddresses([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          {t("accountOverview")}
        </p>
        <h2 className="mt-2 font-display text-4xl font-bold text-ink">
          أهلا {user?.fullName}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          تابعي طلباتك ومفضلاتك وعناوينك من مساحة واحدة ناعمة.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-muted">{t("wishlist")}</p>
          <p className="mt-2 text-3xl font-extrabold text-ink">{formatNumber(wishlistCount)}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-muted">{t("cart")}</p>
          <p className="mt-2 text-3xl font-extrabold text-ink">{formatNumber(cartCount)}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-muted">{t("profile")}</p>
          <p className="mt-2 text-base font-extrabold text-ink">{accountSettings.phone}</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
            {t("recentOrders")}
          </p>
          <div className="mt-4 space-y-3">
            {orders.slice(0, 2).map((order) => (
              <Link key={order.id} to={`/account/orders/${order.id}`} className="block rounded-2xl bg-ivory p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-extrabold text-ink">{order.id}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${orderStatusTone[order.status]}`}>
                    {translateOrderStatus(order.status, t)}
                  </span>
                </div>
                <div className="mt-3 flex justify-between text-sm text-muted">
                  <span>{formatDate(order.date)}</span>
                  <span className="font-bold text-ink">{formatPrice(order.total, language)}</span>
                </div>
              </Link>
            ))}
            {orders.length === 0 ? (
              <p className="text-sm text-muted">{t("emptyOrders")}</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
            {t("defaultAddress")}
          </p>
          {defaultAddress ? (
            <div className="mt-4 rounded-2xl bg-ivory p-4 text-sm text-muted">
              <p className="font-extrabold text-ink">{defaultAddress.city}, {defaultAddress.area}</p>
              <p className="mt-2">{defaultAddress.street}, {defaultAddress.building}</p>
              <p className="mt-2">{defaultAddress.notes}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              لا يوجد عنوان محفوظ بعد.
            </p>
          )}
          <Button as={Link} to="/account/addresses" className="mt-5" variant="outline">
            {t("addresses")}
          </Button>
        </section>
      </div>
    </div>
  );
}
