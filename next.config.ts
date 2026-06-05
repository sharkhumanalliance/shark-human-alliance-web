import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF first (smallest), fall back to WebP. Applies to next/image.
    formats: ["image/avif", "image/webp"],
    // Cache optimized image variants on the CDN for a year.
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        // Long-lived, effectively-immutable media & fonts in /public.
        // NOTE: files in /public are NOT content-hashed, so "immutable" means a
        // returning visitor keeps the cached copy until the URL changes —
        // rename the file when you change its bytes (e.g. cert-bg-v2.webp).
        // Next's own /_next/static/* is hashed and already immutable; we don't
        // touch it here.
        source:
          "/:path*.(png|jpg|jpeg|gif|webp|avif|woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Icons / manifest / SEO files change occasionally and are referenced by
        // stable URLs, so they must NOT be immutable: cache a day in the
        // browser, a week on the CDN, and revalidate in the background.
        source: "/:file(favicon.svg|manifest.json|robots.txt|sitemap.xml)",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
