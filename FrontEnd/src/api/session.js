export const AUTH_TOKEN_KEY = "rahaf-auth-token";
export const AUTH_REFRESH_TOKEN_KEY = "rahaf-auth-refresh-token";
export const AUTH_USER_KEY = "rahaf-auth-user";

export function readSession() {
  try {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    const refreshToken = window.localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
    const userRaw = window.localStorage.getItem(AUTH_USER_KEY);
    return {
      token,
      refreshToken,
      user: userRaw ? JSON.parse(userRaw) : null,
    };
  } catch {
    return { token: null, refreshToken: null, user: null };
  }
}

export function writeSession({ token, refreshToken, user }) {
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  if (refreshToken) {
    window.localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
  } else {
    window.localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  }

  if (user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}

export function clearSession() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}
