import {
  getPublicTierKey,
  getTierMetadata,
  type PublicTierKey,
} from "@/lib/tiers";

export const ANALYTICS_ATTRIBUTION_SOURCE_KEY = "sha_attribution_source";

export const ANALYTICS_SOURCES = {
  giftReveal: "gift_reveal",
  header: "header",
  hero: "hero",
  homeWanted: "home_wanted_cta",
  stickyCta: "sticky_cta",
  wantedCase: "wanted_case",
  wantedCaseCta: "wanted_case_cta",
  wantedFooterCta: "wanted_footer_cta",
  wantedGiftCta: "wanted_gift_cta",
  wantedPoster: "wanted_poster",
} as const;

export type AnalyticsSource =
  (typeof ANALYTICS_SOURCES)[keyof typeof ANALYTICS_SOURCES];

const CANONICAL_SOURCES = new Set<string>(Object.values(ANALYTICS_SOURCES));

const SOURCE_ALIASES: Record<string, AnalyticsSource> = {
  case_header: ANALYTICS_SOURCES.header,
  home_mobile_sticky_cta: ANALYTICS_SOURCES.stickyCta,
  wanted_case_header_cta: ANALYTICS_SOURCES.wantedCaseCta,
};

const ATTRIBUTION_SOURCE_ALIASES: Record<string, AnalyticsSource> = {
  wanted_poster: ANALYTICS_SOURCES.wantedGiftCta,
};

export type AnalyticsItem = {
  item_id: PublicTierKey;
  item_name: string;
  item_category: "certificate";
  price: number;
  quantity: 1;
};

export function normalizeAnalyticsSource(value?: unknown): AnalyticsSource | "" {
  const normalized = normalizeSourceValue(value);
  if (!normalized) return "";
  if (SOURCE_ALIASES[normalized]) return SOURCE_ALIASES[normalized];
  return CANONICAL_SOURCES.has(normalized)
    ? (normalized as AnalyticsSource)
    : "";
}

export function normalizeAnalyticsAttributionSource(
  value?: unknown,
): AnalyticsSource | "" {
  const normalized = normalizeSourceValue(value);
  if (!normalized) return "";
  if (ATTRIBUTION_SOURCE_ALIASES[normalized]) {
    return ATTRIBUTION_SOURCE_ALIASES[normalized];
  }
  return normalizeAnalyticsSource(normalized);
}

function normalizeSourceValue(value?: unknown) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 64);
}

export function buildCertificateAnalyticsItem(
  tier?: string | null,
): AnalyticsItem {
  const publicTier = getPublicTierKey(tier);
  const metadata = getTierMetadata(publicTier);

  return {
    item_id: publicTier,
    item_name: metadata.stripeName,
    item_category: "certificate",
    price: metadata.priceCents / 100,
    quantity: 1,
  };
}
