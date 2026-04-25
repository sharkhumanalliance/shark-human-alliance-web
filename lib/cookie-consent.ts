export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  updatedAt: string;
};

export const COOKIE_CONSENT_KEY = "sha_cookie_consent";
export const COOKIE_CONSENT_MAX_AGE = 60 * 60 * 24 * 180; // 180 days
export const COOKIE_CONSENT_UPDATED_EVENT = "sha:cookie-consent-updated";

function encodeConsent(consent: CookieConsent): string {
  return encodeURIComponent(JSON.stringify(consent));
}

function decodeConsent(value: string): CookieConsent | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<CookieConsent>;
    if (typeof parsed.analytics !== "boolean") return null;
    return {
      necessary: true,
      analytics: parsed.analytics,
      updatedAt:
        typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function readConsent(): CookieConsent | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";").map((item) => item.trim());
  const raw = cookies.find((item) => item.startsWith(`${COOKIE_CONSENT_KEY}=`));
  if (!raw) return null;
  const value = raw.slice(COOKIE_CONSENT_KEY.length + 1);
  return decodeConsent(value);
}

export function writeConsent(consent: CookieConsent): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_CONSENT_KEY}=${encodeConsent(consent)}; Path=/; Max-Age=${COOKIE_CONSENT_MAX_AGE}; SameSite=Lax; Secure`;
}

export function buildConsent(analytics: boolean): CookieConsent {
  return {
    necessary: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };
}

export function hasConsentDecision(): boolean {
  return readConsent() !== null;
}
