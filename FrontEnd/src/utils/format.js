export const formatNumber = (value, options = {}) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    ...options,
  }).format(Number(value) || 0);

export const formatDecimal = (value, digits = 1) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value) || 0);

export const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  const hasDecimals = !Number.isInteger(amount);

  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(amount)} ₪`;
};

export const formatDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

export const toEnglishDigits = (value) =>
  String(value)
    .replace(/[\u0660-\u0669]/g, (digit) => digit.charCodeAt(0) - 0x0660)
    .replace(/[\u06f0-\u06f9]/g, (digit) => digit.charCodeAt(0) - 0x06f0);
