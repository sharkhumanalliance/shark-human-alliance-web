/**
 * Minimal QR-code SVG generator — zero external dependencies.
 *
 * Uses the free goqr.me / qrserver API to generate a QR code image URL,
 * OR renders a simple SVG placeholder if called server-side.
 *
 * For production you can swap to a local generator (e.g. npm `qrcode`).
 */

const QR_API = "https://api.qrserver.com/v1/create-qr-code";

/**
 * Returns an image URL for a QR code encoding `data`.
 * @param data  The string to encode (typically a URL)
 * @param size  Pixel size of the QR code image (square)
 */
export function getQrCodeUrl(data: string, size = 200): string {
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data,
    format: "svg",
    margin: "0",
    ecc: "M",
  });
  return `${QR_API}?${params.toString()}`;
}

/**
 * Build the full verification URL for a member.
 * If the registryId looks like a sample/placeholder (e.g. SHA-XXXX),
 * returns a link to the sample verification page instead.
 */
export function getVerificationUrl(
  memberId: string,
  baseUrl?: string,
  locale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en"
): string {
  const base =
    baseUrl ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com");

  const isSample =
    memberId.includes("xxxx") ||
    memberId.includes("XXXX") ||
    memberId === "sample";

  return `${base}/${locale}/verify?id=${isSample ? "sample" : encodeURIComponent(memberId)}`;
}
