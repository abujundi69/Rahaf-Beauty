const defaultAnnouncement = {
  enabled: false,
  textAr: "",
  textEn: "",
  backgroundColor: "#050505",
  textColor: "#FFFEFC",
  linkTextAr: "",
  linkTextEn: "",
  linkUrl: "",
  startDate: "",
  endDate: "",
};

const defaultDiscounts = {
  global: {
    enabled: false,
    percentage: "",
    startDate: "",
    endDate: "",
  },
  categories: [],
  products: [],
};

export const defaultStoreSettings = {
  storeName: "RAHAF BEAUTY",
  logoUrl: "",
  contactEmail: "",
  phone: "",
  address: "",
  currency: "ILS",
  announcement: defaultAnnouncement,
  discounts: defaultDiscounts,
};

export function mergeStoreSettings(settings = {}) {
  return {
    ...defaultStoreSettings,
    ...settings,
    currency: "ILS",
    announcement: {
      ...defaultAnnouncement,
      ...(settings.announcement ?? {}),
    },
    discounts: {
      ...defaultDiscounts,
      ...(settings.discounts ?? {}),
      global: {
        ...defaultDiscounts.global,
        ...(settings.discounts?.global ?? {}),
      },
      categories: Array.isArray(settings.discounts?.categories)
        ? settings.discounts.categories
        : [],
      products: Array.isArray(settings.discounts?.products)
        ? settings.discounts.products
        : [],
    },
  };
}

export function readStoreSettings() {
  return mergeStoreSettings();
}

export function isDateRangeActive(startDate, endDate, now = new Date()) {
  const currentTime = now.getTime();

  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`);
    if (!Number.isNaN(start.getTime()) && currentTime < start.getTime()) {
      return false;
    }
  }

  if (endDate) {
    const end = new Date(`${endDate}T23:59:59`);
    if (!Number.isNaN(end.getTime()) && currentTime > end.getTime()) {
      return false;
    }
  }

  return true;
}
