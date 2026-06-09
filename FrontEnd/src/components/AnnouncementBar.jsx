import { Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useStoreSettings } from "../context/StoreSettingsContext.jsx";
import { isDateRangeActive } from "../utils/settings.js";

export default function AnnouncementBar() {
  const { language } = useLanguage();
  const { settings } = useStoreSettings();
  const announcement = settings.announcement;

  if (
    !announcement.enabled ||
    !isDateRangeActive(announcement.startDate, announcement.endDate)
  ) {
    return null;
  }

  const text = language === "ar" ? announcement.textAr : announcement.textEn;
  const linkText = language === "ar" ? announcement.linkTextAr : announcement.linkTextEn;

  return (
    <div
      className="px-4 py-2 text-center text-sm font-semibold"
      style={{
        backgroundColor: announcement.backgroundColor,
        color: announcement.textColor,
      }}
    >
      <span className="inline-flex flex-wrap items-center justify-center gap-2">
        <Sparkles className="h-4 w-4 text-terracotta" aria-hidden="true" />
        {text}
        {announcement.linkUrl && linkText ? (
          <a
            href={announcement.linkUrl}
            className="underline decoration-terracotta decoration-2 underline-offset-4"
          >
            {linkText}
          </a>
        ) : null}
      </span>
    </div>
  );
}
