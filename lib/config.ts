/**
 * Shared configuration constants.
 *
 * NEXT_PUBLIC_BASE_URL is available on both server and client because of the
 * `NEXT_PUBLIC_` prefix.  The hardcoded fallback ensures things still work
 * during `next build` when env vars may not yet be injected.
 */
function normalizeBaseUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname === "sharkhumanalliance.com") {
      url.hostname = "www.sharkhumanalliance.com";
    }
    return url.origin;
  } catch {
    return "https://www.sharkhumanalliance.com";
  }
}

export const BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.sharkhumanalliance.com",
);
