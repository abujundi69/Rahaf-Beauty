import { toMediaUrl } from "./httpClient.js";

export function extractItems(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.items)) return result.items;
  return [];
}

export function normalizeRole(role) {
  return String(role ?? "").toLowerCase() === "admin" ? "admin" : "customer";
}

export function normalizeUser(user) {
  if (!user) return null;
  return {
    id: String(user.id),
    fullName: user.fullName ?? "",
    phoneNumber: user.phoneNumber ?? user.phone ?? "",
    phone: user.phoneNumber ?? user.phone ?? "",
    role: normalizeRole(user.role),
  };
}

export function normalizeCategory(category) {
  if (!category) return null;
  const imagePath = category.imageUrl ?? "";
  const imageUrl = toMediaUrl(imagePath);
  return {
    id: String(category.id),
    slug: category.slug || String(category.id),
    name: category.name ?? "",
    nameAr: category.name ?? "",
    nameEn: category.name ?? "",
    subtitle: category.description ?? "",
    subtitleAr: category.description ?? "",
    subtitleEn: category.description ?? "",
    intro: category.description ?? "",
    introAr: category.description ?? "",
    introEn: category.description ?? "",
    image: imageUrl,
    imageUrl,
    imagePath,
    status: category.isActive === false ? "Draft" : "Active",
    isActive: category.isActive !== false,
  };
}

export function normalizeBrand(brand) {
  if (!brand || typeof brand !== "object") return null;
  return {
    id: String(brand.id),
    slug: brand.slug || String(brand.id),
    name: brand.name ?? "",
    description: brand.description ?? "",
    image: toMediaUrl(brand.imageUrl),
    imageUrl: toMediaUrl(brand.imageUrl),
    isActive: brand.isActive !== false,
  };
}

function normalizeProductMedia(product) {
  const images = (product.images ?? [])
    .map((image, index) => ({
      id: String(image.id ?? `image-${index}`),
      name: image.altText || `صورة ${index + 1}`,
      type: "image",
      size: 0,
      previewUrl: toMediaUrl(image.imageUrl),
      url: toMediaUrl(image.imageUrl),
      sortOrder: image.sortOrder ?? index,
    }))
    .filter((image) => image.url);

  const videos = (product.videos ?? [])
    .map((video, index) => ({
      id: String(video.id ?? `video-${index}`),
      name: `فيديو ${index + 1}`,
      type: "video",
      size: 0,
      previewUrl: toMediaUrl(video.videoUrl),
      url: toMediaUrl(video.videoUrl),
      sortOrder: video.sortOrder ?? index,
    }))
    .filter((video) => video.url);

  const mainImage = toMediaUrl(product.mainImageUrl);
  if (mainImage && images.length === 0) {
    images.push({
      id: "main-image",
      name: "الصورة الرئيسية",
      type: "image",
      size: 0,
      previewUrl: mainImage,
      url: mainImage,
      sortOrder: 0,
    });
  }

  return { images, video: videos[0] ?? null };
}

export function normalizeProduct(product) {
  if (!product) return null;
  const category = normalizeCategory(product.category);
  const brand = normalizeBrand(product.brand);
  const brandName = product.brandName ?? brand?.name ?? (typeof product.brand === "string" ? product.brand : "");
  const media = normalizeProductMedia(product);
  const price = Number(product.effectivePrice ?? product.basePrice) || 0;
  const basePrice = Number(product.basePrice) || 0;
  const oldPrice = basePrice > price ? basePrice : null;
  const availability = product.isActive === false ? "Unavailable" : "In Stock";

  return {
    id: String(product.id),
    slug: product.slug || String(product.id),
    name: product.name ?? "",
    nameAr: product.name ?? "",
    nameEn: product.name ?? "",
    brand: brandName,
    brandName,
    brandId: product.brandId ? String(product.brandId) : brand?.id ?? "",
    brandSlug: brand?.slug ?? "",
    brandData: brand,
    category: category?.slug ?? category?.id ?? "",
    categoryId: category?.id ?? "",
    categorySlug: category?.slug ?? "",
    categoryData: category,
    price,
    oldPrice,
    basePrice,
    effectivePrice: price,
    discountPercent: Number(product.discountPercent) || 0,
    description: product.description ?? "",
    descriptionAr: product.description ?? "",
    descriptionEn: product.description ?? "",
    ingredients: product.ingredients ?? "",
    ingredientsAr: product.ingredients ?? "",
    ingredientsEn: product.ingredients ?? "",
    howToUse: product.howToUse ?? "",
    howToUseAr: product.howToUse ?? "",
    howToUseEn: product.howToUse ?? "",
    isActive: product.isActive !== false,
    isNew: Boolean(product.isNew),
    image: media.images[0]?.url ?? "",
    images: media.images.map((image) => image.url),
    media,
    videoUrl: media.video?.url ?? "",
    colors: (product.colors ?? []).map((color) => ({
      id: String(color.id),
      name: color.name ?? "",
      nameAr: color.name ?? "",
      nameEn: color.name ?? "",
      hex: color.hexCode ?? "#E9B0BF",
    })),
    sizes: (product.sizes ?? []).map((size) => ({
      id: String(size.id),
      label: size.label ?? "",
      price: size.price ?? "",
    })),
    variants: (product.variants ?? []).map((variant) => ({
      id: String(variant.id),
      productColorId: variant.productColorId ? String(variant.productColorId) : null,
      productSizeId: variant.productSizeId ? String(variant.productSizeId) : null,
      price: variant.price ?? "",
    })),
    rating: Number(product.averageRating) || 0,
    reviewCount: Number(product.reviewCount) || 0,
    availability,
    status: product.isActive === false ? "Draft" : "Active",
    createdAt: product.createdAt ?? product.id,
  };
}

export function normalizeCart(cart) {
  const items = (cart?.items ?? []).map((item) => ({
    id: String(item.id),
    productId: String(item.productId),
    quantity: Number(item.quantity) || 1,
    unitPrice: Number(item.finalUnitPrice ?? item.unitPrice) || 0,
    originalUnitPrice: Number(item.unitPrice ?? item.finalUnitPrice) || 0,
    discountPercent: Number(item.discountPercent) || 0,
    lineTotal: Number(item.lineTotal) || 0,
    selectedColor: item.productColorId
      ? {
          id: String(item.productColorId),
          name: item.colorName ?? "",
          nameAr: item.colorName ?? "",
          nameEn: item.colorName ?? "",
          hex: item.colorHex ?? "#E9B0BF",
        }
      : null,
    selectedSize: item.productSizeId
      ? {
          id: String(item.productSizeId),
          label: item.sizeLabel ?? "",
        }
      : null,
    selectedVariantId: item.productVariantId ? String(item.productVariantId) : null,
    product: {
      id: String(item.productId),
      name: item.productName ?? "",
      nameAr: item.productName ?? "",
      nameEn: item.productName ?? "",
      slug: String(item.productId),
      image: toMediaUrl(item.imageUrl),
      images: [toMediaUrl(item.imageUrl)].filter(Boolean),
      brand: "",
      price: Number(item.finalUnitPrice ?? item.unitPrice) || 0,
      oldPrice: item.discountPercent ? Number(item.unitPrice) || 0 : null,
      availability: "In Stock",
      colors: [],
      sizes: [],
    },
  }));

  return {
    id: cart?.id ? String(cart.id) : "",
    items,
    subtotal: Number(cart?.subtotal) || 0,
    discountTotal: Number(cart?.discountTotal) || 0,
    total: Number(cart?.total) || 0,
  };
}

export function normalizeReorderResult(result) {
  return {
    cart: normalizeCart(result?.cart),
    warnings: Array.isArray(result?.warnings)
      ? result.warnings.filter(Boolean).map(String)
      : [],
  };
}

export function normalizeWishlist(wishlist) {
  return {
    id: wishlist?.id ? String(wishlist.id) : "",
    items: (wishlist?.items ?? []).map((item) => ({
      id: String(item.id),
      productId: String(item.productId),
      productName: item.productName ?? "",
      slug: item.slug || String(item.productId),
      imageUrl: toMediaUrl(item.imageUrl),
      basePrice: Number(item.basePrice) || 0,
      product: {
        id: String(item.productId),
        slug: item.slug || String(item.productId),
        name: item.productName ?? "",
        nameAr: item.productName ?? "",
        nameEn: item.productName ?? "",
        image: toMediaUrl(item.imageUrl),
        images: [toMediaUrl(item.imageUrl)].filter(Boolean),
        price: Number(item.basePrice) || 0,
        brand: "",
        availability: "In Stock",
      },
    })),
  };
}

export function normalizeOrderStatus(status) {
  const map = {
    UnderReview: "under_review",
    Approved: "approved",
    Rejected: "rejected",
    Preparing: "preparing",
    Loaded: "shipping",
    Shipping: "shipping",
    Shipped: "out_for_delivery",
    OutForDelivery: "out_for_delivery",
    Delivered: "received",
    Received: "received",
    Cancelled: "cancelled",
  };
  return map[status] ?? status;
}

export function toBackendOrderStatus(status) {
  const map = {
    under_review: "UnderReview",
    approved: "Approved",
    rejected: "Rejected",
    preparing: "Preparing",
    loaded: "Shipping",
    shipping: "Shipping",
    shipped: "OutForDelivery",
    out_for_delivery: "OutForDelivery",
    delivered: "Received",
    received: "Received",
    cancelled: "Cancelled",
  };
  return map[status] ?? status;
}

export function normalizePaymentMethod(method) {
  return method === "CashOnDelivery" ? "cash_on_delivery" : method;
}

export function normalizePaymentStatus(status) {
  const map = {
    Pending: "pending_on_delivery",
    Paid: "paid_on_delivery",
    PendingOnDelivery: "pending_on_delivery",
    PaidOnDelivery: "paid_on_delivery",
  };
  return map[status] ?? status;
}

export function normalizeOrder(order) {
  if (!order) return null;
  const items = (order.items ?? []).map((item) => ({
    id: String(item.id),
    productId: item.productId ? String(item.productId) : "",
    name: item.productName ?? "",
    nameAr: item.productName ?? "",
    nameEn: item.productName ?? "",
    brand: item.brandName ?? "",
    category: item.categoryName ?? "",
    quantity: Number(item.quantity) || 1,
    unitPrice: Number(item.finalUnitPrice ?? item.unitPrice) || 0,
    originalUnitPrice: Number(item.unitPrice ?? item.finalUnitPrice) || 0,
    discountPercent: Number(item.discountPercent) || 0,
    lineTotal: Number(item.lineTotal) || 0,
    selectedColor: item.productColorId || item.colorName
      ? {
          id: item.productColorId ? String(item.productColorId) : "",
          name: item.colorName,
          nameAr: item.colorName,
          nameEn: item.colorName,
          hex: item.colorHex ?? "#E9B0BF",
        }
      : null,
    selectedSize: item.productSizeId || item.sizeLabel
      ? {
          id: item.productSizeId ? String(item.productSizeId) : "",
          label: item.sizeLabel ?? "",
        }
      : null,
    selectedVariantId: item.productVariantId ? String(item.productVariantId) : null,
  }));
  const createdAt = order.createdAt ?? new Date().toISOString();
  const status = normalizeOrderStatus(order.status);

  return {
    id: String(order.id),
    orderNumber: order.orderNumber ?? String(order.id),
    userId: order.userId ? String(order.userId) : null,
    customerDeleted: Boolean(order.customerDeleted),
    customerName: order.customerName ?? "",
    customerPhone: order.customerPhone ?? "",
    phone: order.customerPhone ?? "",
    createdAt,
    date: createdAt,
    status,
    paymentMethod: normalizePaymentMethod(order.paymentMethod),
    paymentStatus: normalizePaymentStatus(order.paymentStatus),
    deliveryAddress: {
      fullName: order.customerName ?? "",
      phone: order.customerPhone ?? "",
      city: order.city ?? "",
      area: order.area ?? "",
      street: order.street ?? "",
      building: order.building ?? "",
      notes: order.notes ?? "",
      address: [order.city, order.area, order.street].filter(Boolean).join("، "),
    },
    subtotal: Number(order.subtotal) || Number(order.total) || 0,
    discountTotal: Number(order.discountTotal) || 0,
    shipping: Number(order.deliveryFee) || 0,
    tax: 0,
    total: Number(order.total) || 0,
    itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
    items,
    statusHistory: (order.statusHistory ?? []).map((entry) => ({
      id: String(entry.id),
      status: normalizeOrderStatus(entry.status),
      changedAt: entry.changedAt,
      changedBy: entry.changedByUserId ? String(entry.changedByUserId) : "",
      note: entry.note ?? "",
    })),
  };
}

export function normalizeSettings(data) {
  const store = data?.storeSettings ?? data ?? {};
  const announcement = data?.announcement ?? {};
  return {
    storeName: store.storeName ?? "RAHAF BEAUTY",
    logoUrl: toMediaUrl(store.logoUrl),
    contactEmail: store.contactEmail ?? "",
    phone: store.phone ?? "",
    address: store.address ?? "",
    currency: store.currency ?? "ILS",
    announcement: normalizeAnnouncement(announcement),
    discounts: {
      global: {
        id: "",
        percentage: "",
        enabled: false,
        labelAr: "",
        labelEn: "",
        startDate: "",
        endDate: "",
      },
      brands: [],
      products: [],
    },
  };
}

export function normalizeAnnouncement(announcement) {
  return {
    id: announcement?.id ? String(announcement.id) : "",
    enabled: Boolean(announcement?.isEnabled),
    textAr: announcement?.text ?? "",
    textEn: announcement?.text ?? "",
    backgroundColor: announcement?.backgroundColor ?? "#000000",
    textColor: announcement?.textColor ?? "#FFFFFF",
    linkTextAr: announcement?.linkText ?? "",
    linkTextEn: announcement?.linkText ?? "",
    linkUrl: announcement?.linkUrl ?? "",
    startDate: announcement?.startDate ? String(announcement.startDate).slice(0, 10) : "",
    endDate: announcement?.endDate ? String(announcement.endDate).slice(0, 10) : "",
  };
}

export function normalizeAddress(address) {
  if (!address) return null;
  return {
    id: String(address.id),
    city: address.city ?? "",
    area: address.area ?? "",
    street: address.street ?? "",
    building: address.building ?? "",
    notes: address.notes ?? "",
    isDefault: Boolean(address.isDefault),
  };
}

export function normalizeReview(review) {
  if (!review) return null;

  return {
    id: String(review.id),
    productId: review.productId ? String(review.productId) : "",
    userId: review.userId ? String(review.userId) : "",
    customerName: review.customerName ?? "",
    rating: Math.min(5, Math.max(1, Number(review.rating) || 1)),
    comment: review.comment ?? "",
    createdAt: review.createdAt ?? new Date().toISOString(),
  };
}

export function normalizePagedReviews(result) {
  return {
    page: Number(result?.page) || 1,
    pageSize: Number(result?.pageSize) || 20,
    total: Number(result?.totalCount ?? result?.total) || extractItems(result).length,
    totalPages: Number(result?.totalPages) || 1,
    items: extractItems(result).map(normalizeReview).filter(Boolean),
  };
}
