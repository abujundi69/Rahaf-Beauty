import { httpClient } from "./httpClient.js";
import { normalizeUser } from "./normalizers.js";

function normalizeAuthResponse(response) {
  return {
    token: response?.token ?? "",
    refreshToken: response?.refreshToken ?? "",
    user: normalizeUser(response?.user),
  };
}

export const authApi = {
  async login({ phoneNumber, password }) {
    const response = await httpClient.post("/auth/login", { phoneNumber, password });
    return normalizeAuthResponse(response);
  },

  async registerCustomer({ fullName, phoneNumber, password }) {
    const response = await httpClient.post("/auth/register-customer", {
      fullName,
      phoneNumber,
      password,
    });
    return normalizeAuthResponse(response);
  },

  async me() {
    const response = await httpClient.get("/auth/me");
    return normalizeUser(response);
  },

  logout() {
    return httpClient.post("/auth/logout");
  },
};
