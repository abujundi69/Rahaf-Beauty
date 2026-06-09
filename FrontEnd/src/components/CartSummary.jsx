import Button from "./Button.jsx";
import { Link } from "react-router-dom";
import { formatPrice } from "../utils/catalog.js";
import { useLanguage } from "../context/LanguageContext.jsx";
import { calculateOrderTotals } from "../utils/pricing.js";

export default function CartSummary({
  subtotal,
  discountTotal = 0,
  total: backendTotal,
  showCheckoutButton = true,
}) {
  const { language, t } = useLanguage();
  const { shipping, tax, total: calculatedTotal } = calculateOrderTotals(subtotal);
  const total = backendTotal ?? calculatedTotal;

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="font-display text-2xl font-bold text-ink">{t("orderSummary")}</h2>
      <div className="mt-6 space-y-4 text-sm">
        <div className="flex justify-between text-muted">
          <span>{t("subtotal")}</span>
          <span className="font-semibold text-ink">{formatPrice(subtotal, language)}</span>
        </div>
        {shipping > 0 ? (
          <div className="flex justify-between text-muted">
            <span>{t("shipping")}</span>
            <span className="font-semibold text-ink">
              {formatPrice(shipping, language)}
            </span>
          </div>
        ) : null}
        {tax > 0 ? (
          <div className="flex justify-between text-muted">
            <span>{t("estimatedTax")}</span>
            <span className="font-semibold text-ink">{formatPrice(tax, language)}</span>
          </div>
        ) : null}
        {discountTotal > 0 ? (
          <div className="flex justify-between text-muted">
            <span>{t("discount")}</span>
            <span className="font-semibold text-sale">-{formatPrice(discountTotal, language)}</span>
          </div>
        ) : null}
        <div className="h-px bg-petal" />
        <div className="flex justify-between text-base font-extrabold text-ink">
          <span>{t("total")}</span>
          <span>{formatPrice(total, language)}</span>
        </div>
      </div>
      {showCheckoutButton ? (
        subtotal > 0 ? (
          <Button as={Link} to="/checkout" className="mt-6 w-full">
            {t("checkout")}
          </Button>
        ) : (
          <Button className="mt-6 w-full" disabled>
            {t("checkout")}
          </Button>
        )
      ) : null}
    </section>
  );
}
