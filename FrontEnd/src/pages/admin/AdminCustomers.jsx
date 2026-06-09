import { Eye, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi.js";
import { toArabicError } from "../../api/httpClient.js";
import Button from "../../components/Button.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { formatPrice } from "../../utils/catalog.js";
import { formatNumber } from "../../utils/format.js";
import { productStatusTone, translateProductStatus } from "../../utils/status.js";

export default function AdminCustomers() {
  const { language, t } = useLanguage();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    adminApi
      .listCustomers()
      .then((result) => {
        if (active) setCustomers(result);
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
  }, []);

  const visibleCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return customers;

    return customers.filter((customer) =>
      [customer.fullName, customer.phoneNumber]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
    );
  }, [customers, query]);

  return (
    <section className="beauty-shell min-w-0 p-5">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          {t("customersManagement")}
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink">{t("customersManagement")}</h2>
        {error ? <p className="mt-3 text-sm font-bold text-sale">{error}</p> : null}
      </div>
      <label className="relative mb-4 block max-w-md">
        <span className="sr-only">{t("search")}</span>
        <Search
          className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search")}
          className="h-11 w-full rounded-full bg-ivory pe-4 ps-11 text-sm font-semibold text-ink outline-none transition focus:ring-4 focus:ring-shell/70"
        />
      </label>
      <div className="grid gap-3">
        {loading ? (
          <div className="rounded-2xl bg-shell p-8 text-center text-sm font-bold text-muted">
            {t("loading")}
          </div>
        ) : null}
        {!loading && !error && visibleCustomers.length === 0 ? (
          <div className="rounded-2xl bg-shell p-8 text-center text-sm font-bold text-muted">
            {t("noData")}
          </div>
        ) : null}
        {visibleCustomers.map((customer) => (
          <article key={customer.id} className="grid gap-4 rounded-[1.2rem] border border-petal/60 bg-white/95 p-4 shadow-sm transition hover:border-clay/40 hover:bg-shell/40 md:grid-cols-[1fr_auto]">
            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <p className="font-extrabold text-ink">{customer.fullName}</p>
                <p className="mt-1 text-sm text-muted">{customer.phoneNumber}</p>
              </div>
              <p className="text-sm font-semibold text-muted">{customer.phoneNumber}</p>
              <p className="text-sm font-semibold text-muted">
                {formatNumber(customer.ordersCount)} {t("orders")}
              </p>
              <p className="text-sm font-extrabold text-ink">
                {formatPrice(customer.totalSpent, language)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${productStatusTone[customer.status]}`}>
                {translateProductStatus(customer.status, t)}
              </span>
              <button
                type="button"
                onClick={() => setSelectedCustomer(customer)}
                className="grid h-9 w-9 place-items-center rounded-full bg-shell text-terracotta shadow-sm hover:bg-petal/80"
                aria-label={t("viewDetails")}
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {selectedCustomer ? (
        <div className="fixed inset-0 z-[150] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[1.5rem] border border-petal bg-white p-6 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
              {t("customerDetails")}
            </p>
            <h3 className="mt-2 font-display text-3xl font-bold text-ink">
              {selectedCustomer.fullName}
            </h3>
            <div className="mt-5 grid gap-3 text-sm text-muted">
              <p>{selectedCustomer.phoneNumber}</p>
              <p>{t("ordersCount")}: {formatNumber(selectedCustomer.ordersCount)}</p>
              <p>{t("totalSpent")}: {formatPrice(selectedCustomer.totalSpent, language)}</p>
            </div>
            <Button className="mt-6" variant="outline" onClick={() => setSelectedCustomer(null)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
