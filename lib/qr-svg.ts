/**
 * Local QR-code generator — renders the QR as an inline SVG data URI.
 *
 * Generated synchronously with the `qrcode` package (pure JS, isomorphic), so
 * there is no runtime dependency on a third-party QR API and no extra network
 * request / DNS / TLS hop when a certificate is displayed.
 */

import QRCode from "qrcode";

/**
 * Returns a `data:image/svg+xml` URI for a QR code encoding `data`, usable
 * directly as an <img src>.
 * @param data  The string to encode (typically a URL)
 * @param size  Rendered pixel size of the QR code image (square)
 */
export function getQrCodeUrl(data: string, size = 200): string {
  const qr = QRCode.create(data, { errorCorrectionLevel: "M" });
  const count = qr.modules.size;
  const bits = qr.modules.data;

  let path = "";
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (bits[r * count + c]) {
        path += `M${c} ${r}h1v1h-1z`;
      }
    }
  }

  // Brand-styled: navy modules on a white quiet zone (2 modules on each
  // side). The white backing keeps the code scannable on parchment and
  // poster backgrounds; navy stays well within scanner contrast limits.
  const margin = 2;
  const total = count + margin * 2;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
    `viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">` +
    `<rect width="${total}" height="${total}" fill="#ffffff"/>` +
    `<path d="${path}" fill="#15324d" transform="translate(${margin} ${margin})"/></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Build the full verification URL for a member.
 * If the registryId looks like a sample/placeholder (e.g. SHA-XXXX),
 * returns a link to the sample verification page instead.
 */
export function getVerificationUrl(
  memberId: string,
  baseUrl?: string,
  locale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en",
  referralCode?: string
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

  const params = new URLSearchParams({
    id: isSample ? "sample" : memberId,
  });

  if (referralCode) {
    params.set("ref", referralCode);
  }

  return `${base}/${locale}/verify?${params.toString()}`;
}

/**
 * Build the private certificate access URL for a member.
 *
 * Certificates can be private in the public registry, so the QR code on a real
 * certificate should resolve through the access token instead of the public
 * verification lookup.
 */
export function getCertificateAccessUrl(
  accessToken: string,
  baseUrl?: string,
  locale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en",
): string {
  const base =
    baseUrl ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com");

  const params = new URLSearchParams({ token: accessToken });
  return `${base}/${locale}/certificate/view?${params.toString()}`;
}
