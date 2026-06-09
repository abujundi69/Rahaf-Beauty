import { createContext, useContext, useEffect, useMemo } from "react";
import { translations, interpolate } from "../i18n/translations.js";
import { writeStorage } from "../utils/storage.js";

const LanguageContext = createContext(null);
const STORAGE_KEY = "rahaf-language";
const ARABIC_LANGUAGE = "ar";

export function LanguageProvider({ children }) {
  const language = ARABIC_LANGUAGE;

  useEffect(() => {
    writeStorage(STORAGE_KEY, ARABIC_LANGUAGE);
    document.documentElement.lang = ARABIC_LANGUAGE;
    document.documentElement.dir = "rtl";
  }, []);

  const value = useMemo(() => {
    const dictionary = translations.ar;
    return {
      language: ARABIC_LANGUAGE,
      direction: "rtl",
      isRtl: true,
      setLanguage: () => {},
      t: (key, values) => {
        const text = dictionary[key] ?? key;
        return values ? interpolate(text, values) : text;
      },
    };
  }, []);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
