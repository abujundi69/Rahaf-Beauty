import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AdminNotificationsProvider } from "./context/AdminNotificationsContext.jsx";
import { BackendConnectionProvider } from "./context/BackendConnectionContext.jsx";
import { CatalogProvider } from "./context/CatalogContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { OrdersProvider } from "./context/OrdersContext.jsx";
import { StoreSettingsProvider } from "./context/StoreSettingsContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { StoreProvider } from "./utils/store.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <BackendConnectionProvider>
          <AuthProvider>
            <StoreSettingsProvider>
              <AdminNotificationsProvider>
                <CatalogProvider>
                  <ToastProvider>
                    <OrdersProvider>
                      <StoreProvider>
                        <App />
                      </StoreProvider>
                    </OrdersProvider>
                  </ToastProvider>
                </CatalogProvider>
              </AdminNotificationsProvider>
            </StoreSettingsProvider>
          </AuthProvider>
        </BackendConnectionProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
