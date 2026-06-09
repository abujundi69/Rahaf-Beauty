import { isDateRangeActive, readStoreSettings } from "./settings.js";
import { getSizePriceOverride } from "./variants.js";

const clampDiscount = (value) => Math.min(100, Math.max(0, Number(value) || 0));

const roundPrice = (value) => Math.round((Number(value) || 0) * 100) / 100;

function activeDiscount(discount, now) {
  const percentage = clampDiscount(discount?.percentage);

  if (!discount?.enabled || percentage <= 0) return null;
  if (!isDateRangeActive(discount.startDate, discount.endDate, now)) return null;

  return {
    ...discount,
    percentage,
  };
}

export function getDiscountForProduct(product, settings = readStoreSettings(), now = new Date()) {
  const discounts = settings.discounts ?? {};
  const productDiscount = (discounts.products ?? []).find(
    (discount) => discount.productId === product.id,
  );
  const categoryDiscount = (discounts.categories ?? []).find(
    (discount) =>
      discount.categoryId &&
      (discount.categoryId === product.categoryId ||
        discount.categoryId === product.category ||
        discount.categoryId === product.categorySlug),
  );

  const candidates = [
    { scope: "product", discount: productDiscount },
    { scope: "category", discount: categoryDiscount },
    { scope: "global", discount: discounts.global },
  ];

  for (const candidate of candidates) {
    const discount = activeDiscount(candidate.discount, now);
    if (discount) {
      return {
        ...discount,
        scope: candidate.scope,
      };
    }
  }

  return null;
}

export function calculateProductPricing(product, settings = readStoreSettings(), options = {}) {
  const sizeOverride = getSizePriceOverride(options.selectedSize);
  const backendDiscountPercent = clampDiscount(product?.discountPercent);
  const backendFinalPrice = Number(product?.effectivePrice ?? product?.price) || 0;
  const backendBasePrice = Number(product?.basePrice ?? product?.oldPrice ?? backendFinalPrice) || 0;

  if (!sizeOverride && backendDiscountPercent > 0 && backendFinalPrice > 0) {
    return {
      basePrice: backendBasePrice || backendFinalPrice,
      originalPrice: backendBasePrice || backendFinalPrice,
      finalPrice: backendFinalPrice,
      unitPrice: backendFinalPrice,
      hasDiscount: backendFinalPrice < (backendBasePrice || backendFinalPrice),
      discountPercent: backendDiscountPercent,
      discountScope: "backend",
      labelAr: "",
      labelEn: "",
    };
  }

  const currentPrice = sizeOverride?.price ?? (Number(product?.price) || 0);
  const oldPrice = Number(sizeOverride?.oldPrice ?? product?.oldPrice) || 0;
  const legacySale = oldPrice > currentPrice;
  const discount = getDiscountForProduct(product, settings);
  const basePrice = legacySale ? oldPrice : currentPrice;

  if (discount) {
    const finalPrice = roundPrice(basePrice * (1 - discount.percentage / 100));
    return {
      basePrice,
      originalPrice: basePrice,
      finalPrice,
      unitPrice: finalPrice,
      hasDiscount: finalPrice < basePrice,
      discountPercent: discount.percentage,
      discountScope: discount.scope,
      labelAr: discount.labelAr || "",
      labelEn: discount.labelEn || "",
    };
  }

  if (legacySale) {
    const discountPercent = Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
    return {
      basePrice: oldPrice,
      originalPrice: oldPrice,
      finalPrice: currentPrice,
      unitPrice: currentPrice,
      hasDiscount: true,
      discountPercent,
      discountScope: "legacy",
      labelAr: "",
      labelEn: "",
    };
  }

  return {
    basePrice: currentPrice,
    originalPrice: currentPrice,
    finalPrice: currentPrice,
    unitPrice: currentPrice,
    hasDiscount: false,
    discountPercent: 0,
    discountScope: "",
    labelAr: "",
    labelEn: "",
  };
}

export function getDiscountBadge(pricing, language = "en") {
  if (!pricing?.hasDiscount || !pricing.discountPercent) return "";

  if (language === "ar") {
    return pricing.labelAr || `خصم ${pricing.discountPercent}%`;
  }

  return pricing.labelAr || `خصم ${pricing.discountPercent}%`;
}

export function calculateOrderTotals(subtotal) {
  const normalizedSubtotal = roundPrice(subtotal);
  const shipping = 0;
  const tax = 0;

  return {
    subtotal: normalizedSubtotal,
    shipping,
    tax,
    total: roundPrice(normalizedSubtotal + shipping + tax),
  };
}
