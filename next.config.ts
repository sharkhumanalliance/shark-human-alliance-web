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
        // Immutable, hashed-or-stable static assets in /public (images, fonts).
        // Long-lived cache so repeat views and shares hit the CDN, not origin.
        source:
          "/:path*.(png|webp|avif|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
