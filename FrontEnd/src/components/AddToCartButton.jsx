import { Check, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { cn } from "../utils/cn.js";
import { useStore } from "../utils/store.jsx";

const sizes = {
  xs: "h-8 min-w-[5.2rem] px-1.5 text-[0.64rem]",
  sm: "h-9 min-w-[7.4rem] px-3 text-xs",
  md: "h-11 min-w-[9.5rem] px-5 text-sm",
  lg: "h-12 min-w-[10.5rem] px-6 text-base",
};

const variants = {
  primary:
    "bg-gradient-to-r from-clay to-terracotta text-white shadow-[0_14px_30px_rgba(219,39,119,0.22)] hover:shadow-[0_18px_34px_rgba(219,39,119,0.28)]",
  dark: "bg-gradient-to-r from-charcoal to-terracotta text-white shadow-card hover:from-terracotta hover:to-clay",
  outline:
    "border border-clay/25 bg-white text-ink shadow-sm hover:border-clay hover:bg-shell/70 hover:text-terracotta",
};

export default function AddToCartButton({
  productId,
  quantity = 1,
  disabled = false,
  size = "md",
  variant = "primary",
  className = "",
  iconOnly = false,
  selectedColor = null,
  selectedSize = null,
  requireColor = false,
  requireSize = false,
  onValidationError,
  onAdded,
  onClick,
  ...props
}) {
  const { addToCart, openAuthRequiredModal } = useStore();
  const { isAuthenticated, isCustomer } = useAuth();
  const { t } = useLanguage();
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const handleClick = async (event) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled || added || busy) return;

    if (!isAuthenticated || !isCustomer) {
      openAuthRequiredModal();
      return;
    }

    if (requireColor && !selectedColor) {
      onValidationError?.("color");
      return;
    }

    if (requireSize && !selectedSize) {
      onValidationError?.("size");
      return;
    }

    setBusy(true);
    const result = await addToCart(productId, quantity, { selectedColor, selectedSize });
    setBusy(false);

    if (result.ok) {
      setAdded(true);
      onAdded?.();
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setAdded(false), 1400);
    }
  };

  const Icon = added ? Check : ShoppingBag;
  const label = added ? t("added") : t("addToCart");

  return (
    <button
      type="button"
      aria-label={label}
      aria-live="polite"
      disabled={disabled || added || busy}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-extrabold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0",
        size === "xs" ? "gap-1.5" : "gap-2",
        sizes[size],
        variants[variant],
        added && "scale-[1.02] bg-olive text-white shadow-soft",
        className,
      )}
      {...props}
      onClick={handleClick}
    >
      <span
        className={cn(
          "absolute inset-0 origin-center opacity-0 transition-opacity duration-300",
          added && "animate-[addCartPulse_1.1s_ease-out] bg-white/20 opacity-100",
        )}
        aria-hidden="true"
      />
      <Icon
        className={cn(
          "relative shrink-0 transition-transform duration-300",
          size === "xs" ? "h-3.5 w-3.5" : "h-4 w-4",
          added && "scale-110",
        )}
        aria-hidden="true"
      />
      {!iconOnly ? <span className="relative whitespace-nowrap">{label}</span> : null}
    </button>
  );
}
