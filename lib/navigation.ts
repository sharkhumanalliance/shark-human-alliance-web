const LOCALE_PREFIX_RE = /^\/(en|es)(?=\/|$)/;

function isExternal(href: string) {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

export function buildLocalizedPath(locale: string, href: string): string {
  if (!href || isExternal(href)) return href;

  if (href.startsWith("#")) {
    return `/${locale}${href}`;
  }

  const [pathAndQuery, hash] = href.split("#");
  const [rawPathname, query] = pathAndQuery.split("?");

  let pathname = rawPathname || "/";
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  pathname = pathname.replace(LOCALE_PREFIX_RE, "") || "/";

  const localizedPath = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return `${localizedPath}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

export function buildAbsoluteUrl(baseUrl: string, href: string): string {
  return new URL(href, baseUrl).toString();
}

export function buildAbsoluteLocalizedUrl(baseUrl: string, locale: string, href: string): string {
  return buildAbsoluteUrl(baseUrl, buildLocalizedPath(locale, href));
}

export function buildReferralHref(referralCode: string): string {
  return `/purchase?tier=protected&ref=${encodeURIComponent(referralCode)}`;
}
