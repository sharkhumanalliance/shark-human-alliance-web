"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { type Locale, dictionaries } from "@/data/i18n";

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof dictionaries)["en"];
};

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: dictionaries.en,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      document.documentElement.lang = newLocale;
    }
  }, []);

  return (
    <I18nContext.Provider
      value={{ locale, setLocale, t: dictionaries[locale] }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
