import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/lib/config";

type Locale = (typeof routing.locales)[number];

function normalizePath(path: string) {
  if (!path || path === "/") return "";
  return path.startsWith("/") ? path : `/${path}`;
}

export function localizedUrl(locale: string, path = "") {
  return `${BASE_URL}/${locale}${normalizePath(path)}`;
}

export function localizedAlternates(
  locale: string,
  path = "",
): NonNullable<Metadata["alternates"]> {
  const normalizedPath = normalizePath(path);
  const languages: Record<string, string> = {};

  for (const supportedLocale of routing.locales) {
    languages[supportedLocale] = localizedUrl(supportedLocale, normalizedPath);
  }

  languages["x-default"] = localizedUrl(routing.defaultLocale, normalizedPath);

  return {
    canonical: localizedUrl(locale, normalizedPath),
    languages,
  };
}

export function localizedSitemapAlternates(path = "") {
  const normalizedPath = normalizePath(path);
  const languages: Record<Locale | "x-default", string> = {
    "x-default": localizedUrl(routing.defaultLocale, normalizedPath),
  } as Record<Locale | "x-default", string>;

  for (const locale of routing.locales) {
    languages[locale] = localizedUrl(locale, normalizedPath);
  }

  return { languages };
}
