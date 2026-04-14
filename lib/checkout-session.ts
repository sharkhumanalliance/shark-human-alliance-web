import crypto from "crypto";

const CHECKOUT_COOKIE_NAME = "sha_checkout_session";
const SIGNATURE_SEPARATOR = ".";

function getCheckoutSessionSecret(): string {
  const secret =
    process.env.CHECKOUT_SESSION_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    process.env.STRIPE_SECRET_KEY;

  if (!secret) {
    throw new Error(
      "Missing checkout session signing secret. Set CHECKOUT_SESSION_SECRET, STRIPE_WEBHOOK_SECRET, or STRIPE_SECRET_KEY."
    );
  }

  return secret;
}

function signSessionId(sessionId: string): string {
  return crypto
    .createHmac("sha256", getCheckoutSessionSecret())
    .update(sessionId)
    .digest("hex");
}

export function getCheckoutSessionCookieName(): string {
  return CHECKOUT_COOKIE_NAME;
}

export function createSignedCheckoutSessionValue(sessionId: string): string {
  return `${sessionId}${SIGNATURE_SEPARATOR}${signSessionId(sessionId)}`;
}

export function isValidSignedCheckoutSessionValue(
  cookieValue: string | undefined,
  expectedSessionId: string
): boolean {
  if (!cookieValue) return false;

  const separatorIndex = cookieValue.indexOf(SIGNATURE_SEPARATOR);
  if (separatorIndex <= 0) return false;

  const sessionId = cookieValue.slice(0, separatorIndex);
  const signature = cookieValue.slice(separatorIndex + 1);
  if (!sessionId || !signature || sessionId !== expectedSessionId) {
    return false;
  }

  const expectedSignature = signSessionId(sessionId);
  return crypto.timingSafeEqual(
    Buffer.from(signature, "utf8"),
    Buffer.from(expectedSignature, "utf8")
  );
}
