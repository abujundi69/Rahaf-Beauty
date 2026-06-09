import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { settingsApi } from "../api/settingsApi.js";
import { toArabicError } from "../api/httpClient.js";
import { defaultStoreSettings, mergeStoreSettings } from "../utils/settings.js";
import { useAuth } from "./AuthContext.jsx";

const StoreSettingsContext = createContext(null);

export function StoreSettingsProvider({ children }) {
  const { isAdmin, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState(defaultStoreSettings);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState("");

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError("");

    try {
      if (isAuthenticated && isAdmin) {
        setSettings(mergeStoreSettings(await settingsApi.getAdminSettings()));
      } else {
        const announcement = await settingsApi.getAnnouncement();
        setSettings(mergeStoreSettings({ announcement }));
      }
    } catch (error) {
      setSettings(mergeStoreSettings());
      setSettingsError(toArabicError(error));
    } finally {
      setSettingsLoading(false);
    }
  }, [isAdmin, isAuthenticated]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = useCallback(async (nextSettings) => {
    await settingsApi.updateStoreSettings(nextSettings);
    const announcement = await settingsApi.updateAnnouncement(nextSettings.announcement);
    const merged = mergeStoreSettings({
      ...nextSettings,
      announcement,
    });
    setSettings(merged);
    return merged;
  }, []);

  const saveStoreInfo = useCallback(async (nextSettings) => {
    await settingsApi.updateStoreSettings(nextSettings);
    setSettings((current) => mergeStoreSettings({ ...current, ...nextSettings }));
  }, []);

  const saveAnnouncementOnly = useCallback(async (announcement) => {
    const updated = await settingsApi.updateAnnouncement(announcement);
    setSettings((current) =>
      mergeStoreSettings({ ...current, announcement: updated }),
    );
  }, []);

  const value = useMemo(
    () => ({
      settings,
      settingsLoading,
      settingsError,
      refreshSettings: loadSettings,
      saveSettings,
      saveStoreInfo,
      saveAnnouncementOnly,
    }),
    [loadSettings, saveAnnouncementOnly, saveSettings, saveStoreInfo, settings, settingsError, settingsLoading],
  );

  return (
    <StoreSettingsContext.Provider value={value}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error("useStoreSettings must be used within StoreSettingsProvider");
  }
  return context;
}
