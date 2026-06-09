function normalizeId(value, fallback) {
  return String(value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizeProductColors(product) {
  const hasSavedColors = Object.prototype.hasOwnProperty.call(product, "colors");
  const source = hasSavedColors && Array.isArray(product.colors)
    ? product.colors
    : [];

  return source
    .map((color, index) => {
      const nameEn = color.nameEn ?? color.colorNameEn ?? color.name ?? "";
      const nameAr = color.nameAr ?? color.colorNameAr ?? color.name ?? nameEn;
      const hex = color.hex ?? color.colorHex ?? "#E9B0BF";
      return {
        id: color.id ?? normalizeId(nameEn || nameAr, `color-${index + 1}`),
        nameEn,
        nameAr,
        hex,
      };
    })
    .filter((color) => color.nameEn || color.nameAr);
}

export function normalizeProductSizes(product) {
  const hasSavedSizes = Object.prototype.hasOwnProperty.call(product, "sizes");
  const source = hasSavedSizes && Array.isArray(product.sizes)
    ? product.sizes
    : [];

  return source
    .map((size, index) => {
      const label = typeof size === "string" ? size : size.label ?? size.size ?? "";
      return {
        id: typeof size === "string"
          ? normalizeId(size, `size-${index + 1}`)
          : size.id ?? normalizeId(label, `size-${index + 1}`),
        label,
        price: typeof size === "string" || size.price == null || size.price === ""
          ? ""
          : Number(size.price),
      };
    })
    .filter((size) => size.label);
}

export function productRequiresColor(product) {
  return Array.isArray(product?.colors) && product.colors.length > 0;
}

export function productRequiresSize(product) {
  return Array.isArray(product?.sizes) && product.sizes.length > 0;
}

export function productHasRequiredVariants(product) {
  return productRequiresColor(product) || productRequiresSize(product);
}

export function getVariantKey(productId, selectedColor, selectedSize) {
  const colorId = selectedColor?.id ?? selectedColor ?? "";
  const sizeId = selectedSize?.id ?? selectedSize?.label ?? selectedSize ?? "";
  return `${productId}::${colorId || "no-color"}::${sizeId || "no-size"}`;
}

export function getColorName(color, language = "en") {
  if (!color) return "";
  return language === "ar"
    ? color.nameAr || color.nameEn || color.name
    : color.nameEn || color.name || color.nameAr;
}

export function getSizeLabel(size) {
  return size?.label ?? size?.size ?? size ?? "";
}

export function resolveVariant(product, selectedColor, selectedSize) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (variants.length === 0) return null;

  const colorId = selectedColor?.id ? String(selectedColor.id) : null;
  const sizeId = selectedSize?.id ? String(selectedSize.id) : null;
  const requiresColor = productRequiresColor(product);
  const requiresSize = productRequiresSize(product);

  if ((requiresColor && !colorId) || (requiresSize && !sizeId)) {
    return null;
  }

  return (
    variants.find((variant) => {
      const matchesColor = requiresColor
        ? String(variant.productColorId ?? "") === colorId
        : !variant.productColorId;
      const matchesSize = requiresSize
        ? String(variant.productSizeId ?? "") === sizeId
        : !variant.productSizeId;
      return matchesColor && matchesSize;
    }) ?? null
  );
}

export function getSizePriceOverride(size) {
  if (!size || size.price === "" || size.price == null) return null;
  const price = Number(size.price);
  if (Number.isNaN(price) || price <= 0) return null;

  return {
    price,
  };
}
