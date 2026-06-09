import { Check, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useStoreSettings } from "../context/StoreSettingsContext.jsx";
import { formatPrice } from "../utils/catalog.js";
import { cn } from "../utils/cn.js";
import { calculateProductPricing } from "../utils/pricing.js";
import { useStore } from "../utils/store.jsx";
import QuantitySelector from "./QuantitySelector.jsx";
import {
  getColorName,
  getSizeLabel,
  getSizePriceOverride,
  productRequiresColor,
  productRequiresSize,
  resolveVariant,
} from "../utils/variants.js";

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
  product = null,
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
  requireQuantitySelection = false,
  onValidationError,
  onAdded,
  onClick,
  ...props
}) {
  const { addToCart, openAuthRequiredModal } = useStore();
  const { products } = useCatalog();
  const { isAuthenticated, isCustomer } = useAuth();
  const { language, t } = useLanguage();
  const { settings } = useStoreSettings();
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [modalColor, setModalColor] = useState(null);
  const [modalSize, setModalSize] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(Math.max(1, Number(quantity) || 1));
  const [modalError, setModalError] = useState("");
  const timeoutRef = useRef(null);
  const productForOptions =
    product ?? products.find((candidate) => candidate.id === productId) ?? null;
  const hasSizeOptions = productRequiresSize(productForOptions);
  const hasColorOptions = productRequiresColor(productForOptions);

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const markAdded = () => {
    setAdded(true);
    onAdded?.();
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setAdded(false), 1400);
  };

  const submitAdd = async (options, requestedQuantity = quantity) => {
    setBusy(true);
    const result = await addToCart(productId, requestedQuantity, {
      ...options,
      product: productForOptions,
    });
    setBusy(false);

    if (result.ok) {
      markAdded();
    }

    return result;
  };

  const openOptionsModal = () => {
    setModalColor(selectedColor ?? null);
    setModalSize(selectedSize ?? null);
    setModalQuantity(Math.max(1, Number(quantity) || 1));
    setModalError("");
    setOptionsOpen(true);
  };

  const closeOptionsModal = () => {
    if (busy) return;
    setOptionsOpen(false);
    setModalError("");
  };

  const confirmOptions = async () => {
    const requestedQuantity = Math.max(1, Number(modalQuantity) || 1);

    if (hasColorOptions && !modalColor) {
      setModalError("color");
      return;
    }

    if (hasSizeOptions && !modalSize) {
      setModalError("size");
      return;
    }

    const variant = resolveVariant(productForOptions, modalColor, modalSize);
    if (
      (productForOptions?.variants ?? []).length > 0 &&
      (hasColorOptions || hasSizeOptions) &&
      !variant
    ) {
      setModalError("variant");
      return;
    }

    const result = await submitAdd({
      selectedColor: modalColor,
      selectedSize: modalSize,
    }, requestedQuantity);

    if (result.ok) {
      setOptionsOpen(false);
      setModalError("");
    }
  };

  const handleClick = async (event) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled || added || busy) return;

    if (!isAuthenticated || !isCustomer) {
      openAuthRequiredModal();
      return;
    }

    if (hasColorOptions || hasSizeOptions || requireQuantitySelection) {
      openOptionsModal();
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

    await submitAdd({ selectedColor, selectedSize }, Math.max(1, Number(quantity) || 1));
  };

  const Icon = added ? Check : ShoppingBag;
  const label = added ? t("added") : t("addToCart");

  return (
    <>
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
      <SizeSelectionModal
        open={optionsOpen}
        product={productForOptions}
        busy={busy}
        language={language}
        settings={settings}
        selectedColor={modalColor}
        selectedSize={modalSize}
        modalQuantity={modalQuantity}
        error={modalError}
        onChangeQuantity={setModalQuantity}
        onSelectColor={(color) => {
          setModalColor(color);
          setModalError("");
        }}
        onSelectSize={(sizeOption) => {
          setModalSize(sizeOption);
          setModalError("");
        }}
        onCancel={closeOptionsModal}
        onConfirm={confirmOptions}
        t={t}
      />
    </>
  );
}

function SizeSelectionModal({
  open,
  product,
  busy,
  language,
  settings,
  selectedColor,
  selectedSize,
  modalQuantity,
  error,
  onChangeQuantity,
  onSelectColor,
  onSelectSize,
  onCancel,
  onConfirm,
  t,
}) {
  if (!open || !product) return null;

  const colors = product.colors ?? [];
  const sizeOptions = product.sizes ?? [];
  const errorMessage =
    error === "color"
      ? t("selectColorValidation")
      : error === "size"
        ? t("selectSizeValidation")
        : error === "variant"
          ? t("variantUnavailable")
          : "";

  return createPortal(
    <div className="fixed inset-0 z-modal grid place-items-center bg-ink/45 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label={t("close")}
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-size-modal-title"
        className="relative max-h-[min(88vh,44rem)] w-[min(94vw,31rem)] overflow-y-auto rounded-[1.4rem] border border-petal/80 bg-white p-5 text-ink shadow-soft sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-terracotta">
              {t("addToCart")}
            </p>
            <h2 id="cart-size-modal-title" className="mt-2 text-2xl font-extrabold leading-8 text-ink">
              {t("selectOptions")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-shell text-muted transition hover:bg-petal hover:text-terracotta"
            aria-label={t("close")}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {colors.length > 0 ? (
          <div className="mt-5">
            <p className="text-sm font-extrabold text-ink">{t("selectColor")}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {colors.map((color) => {
                const selected = selectedColor?.id === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => onSelectColor(color)}
                    className={cn(
                      "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-bold transition",
                      selected
                        ? "border-clay bg-gradient-to-r from-clay to-terracotta text-white shadow-sm"
                        : "border-petal bg-ivory text-ink hover:border-terracotta",
                    )}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-petal"
                      style={{ backgroundColor: color.hex }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{getColorName(color, language)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {sizeOptions.length > 0 ? (
          <div className="mt-5">
            <p className="text-sm font-extrabold text-ink">{t("selectSize")}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {sizeOptions.map((sizeOption) => {
              const selected = selectedSize?.id === sizeOption.id;
              const sizePricing = calculateProductPricing(product, settings, {
                selectedSize: sizeOption,
              });
              const hasPriceOverride = Boolean(getSizePriceOverride(sizeOption));
              return (
                <button
                  key={sizeOption.id}
                  type="button"
                  onClick={() => onSelectSize(sizeOption)}
                  className={cn(
                    "min-h-14 rounded-2xl border px-3 py-2 text-center text-sm font-extrabold transition",
                    selected
                      ? "border-clay bg-gradient-to-r from-clay to-terracotta text-white shadow-sm"
                      : "border-petal bg-ivory text-ink hover:border-terracotta",
                  )}
                >
                  <span className="block truncate">{getSizeLabel(sizeOption)}</span>
                  {hasPriceOverride ? (
                    <span className={cn("mt-1 block text-xs", selected ? "text-white/80" : "text-muted")}>
                      {formatPrice(sizePricing.finalPrice, language)}
                    </span>
                  ) : null}
                </button>
              );
            })}
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-petal/70 bg-ivory/75 px-4 py-3">
          <div>
            <p className="text-sm font-extrabold text-ink">{t("quantity")}</p>
            <p className="mt-1 text-xs font-semibold text-muted">{t("selectQuantity")}</p>
          </div>
          <QuantitySelector
            value={modalQuantity}
            onChange={onChangeQuantity}
            disabled={busy}
            size="md"
          />
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-2xl bg-sale/10 px-4 py-3 text-sm font-bold text-sale">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center rounded-full border border-petal bg-white px-5 text-sm font-extrabold text-muted transition hover:bg-shell hover:text-ink"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-clay to-terracotta px-5 text-sm font-extrabold text-white shadow-card transition hover:-translate-y-0.5"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            {busy ? t("loading") : `${t("addToCart")} (${modalQuantity})`}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
