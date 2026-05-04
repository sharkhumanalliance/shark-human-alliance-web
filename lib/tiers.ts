export type TierKey = "basic" | "protected" | "nonsnack" | "business";
export type PublicTierKey = Exclude<TierKey, "basic">;

type TierMetadata = {
  priceCents: number;
  donationCents: number;
  labelKey: PublicTierKey;
  stripeName: string;
  colorVariant: TierKey;
  isPubliclySelectable: boolean;
};

export const PUBLIC_TIERS: PublicTierKey[] = [
  "protected",
  "nonsnack",
  "business",
];

export const TIER_METADATA: Record<TierKey, TierMetadata> = {
  basic: {
    priceCents: 400,
    donationCents: 100,
    labelKey: "protected",
    stripeName: "Protected Friend Status",
    colorVariant: "basic",
    isPubliclySelectable: false,
  },
  protected: {
    priceCents: 400,
    donationCents: 100,
    labelKey: "protected",
    stripeName: "Protected Friend Status",
    colorVariant: "protected",
    isPubliclySelectable: true,
  },
  nonsnack: {
    priceCents: 1900,
    donationCents: 1200,
    labelKey: "nonsnack",
    stripeName: "Non-Snack Recognition",
    colorVariant: "nonsnack",
    isPubliclySelectable: true,
  },
  business: {
    priceCents: 9900,
    donationCents: 7000,
    labelKey: "business",
    stripeName: "Shark-Free Zone",
    colorVariant: "business",
    isPubliclySelectable: true,
  },
};

export const TIER_PRICES: Record<TierKey, number> = {
  basic: TIER_METADATA.basic.priceCents,
  protected: TIER_METADATA.protected.priceCents,
  nonsnack: TIER_METADATA.nonsnack.priceCents,
  business: TIER_METADATA.business.priceCents,
};

export const TIER_DONATIONS: Record<TierKey, number> = {
  basic: TIER_METADATA.basic.donationCents,
  protected: TIER_METADATA.protected.donationCents,
  nonsnack: TIER_METADATA.nonsnack.donationCents,
  business: TIER_METADATA.business.donationCents,
};

export const TIER_NAMES: Record<TierKey, string> = {
  basic: TIER_METADATA.basic.stripeName,
  protected: TIER_METADATA.protected.stripeName,
  nonsnack: TIER_METADATA.nonsnack.stripeName,
  business: TIER_METADATA.business.stripeName,
};

const TIER_STYLES: Record<
  TierKey,
  {
    badge: string;
    surface: string;
    border: string;
    bullet: string;
    button: string;
    registryBadge: string;
    registryBorder: string;
    selectedCard: string;
    unselectedCard: string;
  }
> = {
  basic: {
    badge: "bg-sky-100 text-sky-800",
    surface: "bg-sky-50/30",
    border: "border-sky-200",
    bullet: "bg-sky-500",
    button: "border border-sky-200 bg-sky-100 text-sky-900 hover:bg-sky-200",
    registryBadge: "bg-sky-100 text-sky-800",
    registryBorder: "border-sky-100",
    selectedCard: "border-sky-400 bg-sky-50",
    unselectedCard: "border-sky-100 bg-white",
  },
  protected: {
    badge:
      "bg-[var(--tier-protected-surface)] text-[var(--tier-protected-text)]",
    surface: "bg-[var(--tier-protected-light)]/35",
    border: "border-[var(--tier-protected-border)]",
    bullet: "bg-[var(--tier-protected)]",
    button:
      "border border-transparent bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)]",
    registryBadge:
      "bg-[var(--tier-protected-surface)] text-[var(--tier-protected-text)]",
    registryBorder: "border-[var(--tier-protected-border-light)]",
    selectedCard:
      "border-[var(--tier-protected)] bg-[var(--tier-protected-light)]",
    unselectedCard: "border-[var(--tier-protected-border-light)] bg-white",
  },
  nonsnack: {
    badge:
      "bg-[var(--tier-nonsnack-surface)] text-[var(--tier-nonsnack-text)]",
    surface: "bg-[var(--tier-nonsnack-light)]/30",
    border: "border-[var(--tier-nonsnack-border)]",
    bullet: "bg-[var(--tier-nonsnack)]",
    button:
      "border border-[var(--tier-nonsnack-border)] bg-[var(--tier-nonsnack-surface)] text-[var(--tier-nonsnack-text)] hover:bg-[var(--tier-nonsnack-border)]",
    registryBadge:
      "bg-[var(--tier-nonsnack-surface)] text-[var(--tier-nonsnack-text)]",
    registryBorder: "border-[var(--tier-nonsnack-border-light)]",
    selectedCard:
      "border-[var(--tier-nonsnack)] bg-[var(--tier-nonsnack-light)]",
    unselectedCard: "border-[var(--tier-nonsnack-border-light)] bg-white",
  },
  business: {
    badge:
      "bg-[var(--tier-business-surface)] text-[var(--tier-business-muted)]",
    surface: "bg-[var(--tier-business-light)]/45",
    border: "border-[var(--tier-business-border)]",
    bullet: "bg-[var(--tier-business)]",
    button:
      "border border-[var(--tier-business-border)] bg-[var(--tier-business-surface)] text-[var(--tier-business-text)] hover:bg-[var(--tier-business-border)]",
    registryBadge:
      "bg-[var(--tier-business-surface)] text-[var(--tier-business-text)]",
    registryBorder: "border-[var(--tier-business-border-light)]",
    selectedCard:
      "border-[var(--tier-business)] bg-[var(--tier-business-light)]/80",
    unselectedCard: "border-[var(--tier-business-border-light)] bg-white",
  },
};

export function isTierKey(value?: string | null): value is TierKey {
  return value === "basic" || value === "protected" || value === "nonsnack" || value === "business";
}

export function normalizeTier(value?: string | null): TierKey {
  return isTierKey(value) ? value : "protected";
}

export function getPublicTierKey(value?: string | null): PublicTierKey {
  return TIER_METADATA[normalizeTier(value)].labelKey;
}

export function getTierMetadata(value?: string | null) {
  return TIER_METADATA[normalizeTier(value)];
}

export function getTierPriceDollars(value?: string | null) {
  return getTierMetadata(value).priceCents / 100;
}

export function getTierPriceLabel(value?: string | null) {
  return `$${getTierPriceDollars(value)}`;
}

export function getTierBadgeClass(value?: string | null) {
  return TIER_STYLES[normalizeTier(value)].badge;
}

export function getTierSurfaceClass(value?: string | null) {
  return TIER_STYLES[normalizeTier(value)].surface;
}

export function getTierBorderClass(value?: string | null, popular?: boolean) {
  if (popular) return "border-[var(--tier-protected-border)]/70";
  return TIER_STYLES[normalizeTier(value)].border;
}

export function getTierBulletClass(value?: string | null) {
  return TIER_STYLES[normalizeTier(value)].bullet;
}

export function getTierButtonClass(value?: string | null) {
  return TIER_STYLES[normalizeTier(value)].button;
}

export function getTierRegistryBadgeClass(value?: string | null) {
  return TIER_STYLES[normalizeTier(value)].registryBadge;
}

export function getTierRegistryBorderClass(value?: string | null) {
  return TIER_STYLES[normalizeTier(value)].registryBorder;
}

export function getTierSelectionClass(value: TierKey, selected: boolean) {
  const styles = TIER_STYLES[value];
  return selected ? styles.selectedCard : styles.unselectedCard;
}
