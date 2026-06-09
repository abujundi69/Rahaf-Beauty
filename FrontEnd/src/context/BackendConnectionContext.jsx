import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { healthApi } from "../api/healthApi.js";

const BackendConnectionContext = createContext(null);
const connectionMessage = "تعذر الاتصال بالخادم، تأكد من تشغيل الخادم.";

export function BackendConnectionProvider({ children }) {
  const [checking, setChecking] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const checkConnection = useCallback(async () => {
    setChecking(true);
    setError("");

    try {
      const healthy = await healthApi.check();
      if (!healthy) throw new Error("health_check_failed");
      setConnected(true);
    } catch {
      setConnected(false);
      setError(connectionMessage);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const value = useMemo(
    () => ({
      checking,
      connected,
      error,
      retryConnection: checkConnection,
    }),
    [checkConnection, checking, connected, error],
  );

  if (checking) {
    return (
      <div dir="rtl" className="grid min-h-screen place-items-center bg-ivory px-4 text-ink">
        <p className="text-sm font-bold">جاري الاتصال بالخادم...</p>
      </div>
    );
  }

  if (!connected) {
    return (
      <BackendConnectionContext.Provider value={value}>
        <div dir="rtl" className="grid min-h-screen place-items-center bg-ivory px-4 text-center text-ink">
          <div className="max-w-md rounded-2xl border border-petal bg-white p-6 shadow-soft">
            <p className="text-base font-extrabold text-sale">{error || connectionMessage}</p>
            <button
              type="button"
              onClick={checkConnection}
              className="mt-5 rounded-full bg-ink px-5 py-2 text-sm font-extrabold text-white transition hover:bg-clay"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </BackendConnectionContext.Provider>
    );
  }

  return (
    <BackendConnectionContext.Provider value={value}>
      {children}
    </BackendConnectionContext.Provider>
  );
}

export function useBackendConnection() {
  const context = useContext(BackendConnectionContext);
  if (!context) {
    throw new Error("useBackendConnection must be used within BackendConnectionProvider");
  }
  return context;
}
