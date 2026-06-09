import { httpClient } from "./httpClient.js";

export const healthApi = {
  async check() {
    const result = await httpClient.get("/health");
    return result?.status === "ok";
  },
};
