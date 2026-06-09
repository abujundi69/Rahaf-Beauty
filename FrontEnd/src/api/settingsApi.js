import { httpClient } from "./httpClient.js";
import { normalizeAnnouncement, normalizeSettings } from "./normalizers.js";

export const settingsApi = {
  async getAdminSettings() {
    return normalizeSettings(await httpClient.get("/admin/settings"));
  },

  async updateStoreSettings(settings) {
    return httpClient.put("/admin/settings", {
      storeName: settings.storeName,
      logoUrl: settings.logoUrl || null,
      contactEmail: settings.contactEmail || null,
      phone: settings.phone || null,
      address: settings.address || null,
      currency: settings.currency || "SAR",
    });
  },

  async getAnnouncement() {
    return normalizeAnnouncement(await httpClient.get("/announcement"));
  },

  async updateAnnouncement(announcement) {
    return normalizeAnnouncement(
      await httpClient.put("/admin/announcement", {
        isEnabled: Boolean(announcement.enabled),
        text: announcement.textAr || "",
        backgroundColor: announcement.backgroundColor || "#000000",
        textColor: announcement.textColor || "#FFFFFF",
        linkText: announcement.linkTextAr || null,
        linkUrl: announcement.linkUrl || null,
        startDate: announcement.startDate || null,
        endDate: announcement.endDate || null,
      }),
    );
  },
};
