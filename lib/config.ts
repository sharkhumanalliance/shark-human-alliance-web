/**
 * Shared configuration constants.
 *
 * NEXT_PUBLIC_BASE_URL is available on both server and client because of the
 * `NEXT_PUBLIC_` prefix.  The hardcoded fallback ensures things still work
 * during `next build` when env vars may not yet be injected.
 */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com";
