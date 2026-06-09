import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { accountApi } from "../api/accountApi.js";
import { authApi } from "../api/authApi.js";
import { toArabicError } from "../api/httpClient.js";
import { clearSession, readSession, writeSession } from "../api/session.js";

const AuthContext = createContext(null);

const emptyAccountSettings = {
  fullName: "",
  phone: "",
  phoneNumber: "",
  city: "",
  area: "",
  street: "",
  notes: "",
  preferredLanguage: "ar",
};

function settingsFromUser(user) {
  return {
    ...emptyAccountSettings,
    fullName: user?.fullName ?? "",
    phone: user?.phoneNumber ?? user?.phone ?? "",
    phoneNumber: user?.phoneNumber ?? user?.phone ?? "",
  };
}

export function AuthProvider({ children }) {
  const initialSession = readSession();
  const [user, setUser] = useState(initialSession.user);
  const [token, setToken] = useState(initialSession.token);
  const [accountSettings, setAccountSettingsState] = useState(() =>
    settingsFromUser(initialSession.user),
  );
  const [authLoading, setAuthLoading] = useState(Boolean(initialSession.token));

  const setAuthenticatedSession = useCallback((session) => {
    writeSession(session);
    setToken(session.token);
    setUser(session.user);
    setAccountSettingsState(settingsFromUser(session.user));
  }, []);

  const logout = useCallback(async () => {
    try {
      if (readSession().token) {
        await authApi.logout();
      }
    } catch {
      // Session cleanup is still required even if the server is unavailable.
    } finally {
      clearSession();
      setToken(null);
      setUser(null);
      setAccountSettingsState(emptyAccountSettings);
    }
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      clearSession();
      setToken(null);
      setUser(null);
      setAccountSettingsState(emptyAccountSettings);
      window.location.assign("/login");
    };

    window.addEventListener("rahaf-auth-expired", handleExpired);
    return () => window.removeEventListener("rahaf-auth-expired", handleExpired);
  }, []);

  useEffect(() => {
    let active = true;
    if (!token) {
      setAuthLoading(false);
      return () => {
        active = false;
      };
    }

    authApi
      .me()
      .then((currentUser) => {
        if (!active) return;
        const nextSession = { token, refreshToken: readSession().refreshToken, user: currentUser };
        writeSession(nextSession);
        setUser(currentUser);
        setAccountSettingsState(settingsFromUser(currentUser));
      })
      .catch(() => {
        if (!active) return;
        clearSession();
        setToken(null);
        setUser(null);
        setAccountSettingsState(emptyAccountSettings);
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const login = useCallback(
    async (phoneNumber, password) => {
      try {
        const session = await authApi.login({
          phoneNumber: phoneNumber.trim(),
          password,
        });
        setAuthenticatedSession(session);
        return { ok: true, user: session.user };
      } catch (error) {
        return { ok: false, message: toArabicError(error), fields: error.fields ?? {} };
      }
    },
    [setAuthenticatedSession],
  );

  const registerCustomer = useCallback(
    async ({ fullName, phoneNumber, password }) => {
      try {
        const session = await authApi.registerCustomer({
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          password,
        });
        setAuthenticatedSession(session);
        return { ok: true, user: session.user };
      } catch (error) {
        return { ok: false, message: toArabicError(error), fields: error.fields ?? {} };
      }
    },
    [setAuthenticatedSession],
  );

  const updateAccountSettings = useCallback(
    async (settings) => {
      if (!user || user.role !== "customer") return { ok: false };

      try {
        const profile = await accountApi.updateProfile({
          fullName: settings.fullName,
          phoneNumber: settings.phoneNumber ?? settings.phone,
          preferredName: settings.preferredName ?? null,
        });
        const nextUser = {
          ...user,
          fullName: profile.fullName,
          phone: profile.phoneNumber,
          phoneNumber: profile.phoneNumber,
        };
        writeSession({ token, refreshToken: readSession().refreshToken, user: nextUser });
        setUser(nextUser);
        setAccountSettingsState({ ...settingsFromUser(nextUser), ...settings });
        return { ok: true, user: nextUser };
      } catch (error) {
        return { ok: false, message: toArabicError(error), fields: error.fields ?? {} };
      }
    },
    [token, user],
  );

  const updateUserInfo = useCallback(
    async ({ fullName }) => {
      try {
        await accountApi.updateUserInfo({ fullName });
        const nextUser = { ...user, fullName };
        writeSession({ token, refreshToken: readSession().refreshToken, user: nextUser });
        setUser(nextUser);
        setAccountSettingsState((prev) => ({ ...prev, fullName }));
        return { ok: true };
      } catch (error) {
        return { ok: false, message: toArabicError(error), fields: error.fields ?? {} };
      }
    },
    [token, user],
  );

  const changePassword = useCallback(async (payload) => {
    try {
      await accountApi.changePassword(payload);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: toArabicError(error), fields: error.fields ?? {} };
    }
  }, []);

  const changeEmail = useCallback(async ({ newEmail }) => {
    try {
      await accountApi.changeEmail({ newEmail });
      const nextUser = { ...user, email: newEmail };
      writeSession({ token, refreshToken: readSession().refreshToken, user: nextUser });
      setUser(nextUser);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: toArabicError(error), fields: error.fields ?? {} };
    }
  }, [token, user]);

  const deleteCurrentCustomer = useCallback(async () => {
    if (!user || user.role !== "customer") return { ok: false };

    try {
      await accountApi.deleteAccount();
      clearSession();
      setToken(null);
      setUser(null);
      setAccountSettingsState(emptyAccountSettings);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: toArabicError(error) };
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      token,
      authLoading,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.role === "admin",
      isCustomer: user?.role === "customer",
      accountSettings,
      login,
      logout,
      registerCustomer,
      updateAccountSettings,
      updateUserInfo,
      changePassword,
      changeEmail,
      deleteCurrentCustomer,
    }),
    [
      accountSettings,
      authLoading,
      changeEmail,
      changePassword,
      deleteCurrentCustomer,
      login,
      logout,
      registerCustomer,
      token,
      updateAccountSettings,
      updateUserInfo,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
