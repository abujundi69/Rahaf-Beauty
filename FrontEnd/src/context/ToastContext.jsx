import { createContext, useContext, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useLanguage } from "./LanguageContext.jsx";
import { cn } from "../utils/cn.js";

const ToastContext = createContext(null);

const toastStyles = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-olive",
    className: "border-olive/25 bg-white",
  },
  error: {
    icon: XCircle,
    iconClass: "text-sale",
    className: "border-sale/25 bg-white",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-clay",
    className: "border-terracotta/30 bg-white",
  },
  info: {
    icon: Info,
    iconClass: "text-ink",
    className: "border-petal bg-white",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const { isRtl } = useLanguage();

  const dismissToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const showToast = ({ message, type = "success" }) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => dismissToast(id), 3200);
  };

  const value = useMemo(() => ({ showToast, dismissToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className={cn(
          "fixed top-[calc(env(safe-area-inset-top)+5.5rem)] z-[170] grid w-[min(92vw,24rem)] gap-3 sm:top-24",
          isRtl ? "left-4" : "right-4",
        )}
      >
        {toasts.map((toast) => {
          const style = toastStyles[toast.type] ?? toastStyles.info;
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-4 text-sm font-semibold text-ink shadow-soft ring-1 ring-black/5",
                style.className,
              )}
              role="status"
            >
              <Icon
                className={cn(
                  "mt-0.5 h-5 w-5 shrink-0",
                  style.iconClass,
                )}
                aria-hidden="true"
              />
              <span className="flex-1 leading-6">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="grid h-6 w-6 place-items-center rounded-full text-muted transition hover:bg-ivory hover:text-ink"
                aria-label="إغلاق الإشعار"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
