import axios from "axios";
import { clearSession, readSession } from "./session.js";

const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5138/api";

export const API_BASE_URL = configuredApiBaseUrl.replace(/\/+$/, "");
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/i, "");

const arabicErrorByStatus = {
  400: "يرجى تصحيح الحقول المطلوبة",
  401: "يجب تسجيل الدخول",
  403: "لا تملك صلاحية الوصول",
  404: "لم يتم العثور على البيانات",
  409: "يوجد تعارض في البيانات المرسلة",
  422: "يرجى تصحيح الحقول المطلوبة",
  500: "حدث خطأ في الخادم",
};

export class ApiClientError extends Error {
  constructor(message, { status, code, fields } = {}) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.fields = fields ?? {};
  }
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

httpClient.interceptors.request.use((config) => {
  const { token } = readSession();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function normalizeError(error) {
  if (!error.response) {
    return new ApiClientError("تعذر الاتصال بالخادم، تأكد من تشغيل الخادم.", {
      status: 0,
      code: "network_error",
    });
  }

  const status = error.response.status;
  const payload = error.response.data;
  const apiError = payload?.error;
  const fields = apiError?.fields ?? {};
  const message =
    apiError?.message ||
    arabicErrorByStatus[status] ||
    "حدث خطأ غير متوقع";

  return new ApiClientError(message, {
    status,
    code: apiError?.code,
    fields,
  });
}

httpClient.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload && typeof payload === "object" && "success" in payload) {
      if (payload.success) return payload.data;
      throw new ApiClientError(
        arabicErrorByStatus[response.status] || "حدث خطأ غير متوقع",
        {
          status: response.status,
          code: payload.error?.code,
          fields: payload.error?.fields,
        },
      );
    }
    return payload;
  },
  (error) => {
    const normalized = normalizeError(error);
    if (normalized.status === 401) {
      clearSession();
      if (!window.location.pathname.startsWith("/login")) {
        window.dispatchEvent(new CustomEvent("rahaf-auth-expired"));
      }
    }
    return Promise.reject(normalized);
  },
);

export function toArabicError(error) {
  if (error instanceof ApiClientError) {
    const fieldMessages = Object.values(error.fields ?? {})
      .flat()
      .filter(Boolean);
    if (fieldMessages.length > 0) {
      return [...new Set(fieldMessages)].slice(0, 3).join("، ");
    }
    return error.message;
  }
  return "حدث خطأ غير متوقع";
}

export function toMediaUrl(url) {
  if (!url) return "";
  if (/^(data:|blob:|https?:\/\/)/.test(String(url))) return url;
  return `${API_ORIGIN}${String(url).startsWith("/") ? "" : "/"}${url}`;
}
