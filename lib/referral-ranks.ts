export interface RankInfo {
  id: string;
  minReferrals: number;
  icon: string;
  label: string;
}

export interface RankUi {
  panelClass: string;
  eyebrowClass: string;
  labelClass: string;
  metaClass: string;
  chipClass?: string;
  chipLabel?: string;
}

export const RANKS: RankInfo[] = [
  { id: "civilian", minReferrals: 0, icon: "🛡️", label: "Registered Diplomat" },
  { id: "intern", minReferrals: 1, icon: "🔰", label: "Probationary Liaison" },
  { id: "fieldAgent", minReferrals: 3, icon: "🕵️", label: "Field Operative" },
  { id: "seniorDiplomat", minReferrals: 5, icon: "🎖️", label: "Senior Diplomat" },
  { id: "ambassador", minReferrals: 10, icon: "👑", label: "Special Envoy" },
  { id: "chiefWhisperer", minReferrals: 25, icon: "🌟", label: "Chief Shark Whisperer" },
];

/**
 * Get the rank ID for a given referral count
 */
export function getRank(referralCount: number): string {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (referralCount >= RANKS[i].minReferrals) {
      return RANKS[i].id;
    }
  }
  return "civilian";
}

/**
 * Get rank info object for a given referral count
 */
export function getRankInfo(referralCount: number): RankInfo {
  const rankId = getRank(referralCount);
  const rankInfo = RANKS.find((r) => r.id === rankId);
  return rankInfo || RANKS[0];
}

/**
 * Get the next rank and how many more referrals are needed to reach it
 */
export function getNextRank(
  referralCount: number
): { rank: RankInfo; remaining: number } | null {
  for (const rank of RANKS) {
    if (rank.minReferrals > referralCount) {
      return {
        rank,
        remaining: rank.minReferrals - referralCount,
      };
    }
  }

  return null;
}

/**
 * Get the progress (0..1) toward the next rank, plus a flag indicating whether
 * the diplomat has already reached the top rank.
 */
export function getRankProgress(referralCount: number): {
  progress: number;
  isTop: boolean;
} {
  const nextRank = getNextRank(referralCount);
  if (!nextRank) return { progress: 1, isTop: true };

  const currentRank = getRankInfo(referralCount);
  const span = nextRank.rank.minReferrals - currentRank.minReferrals;
  const filled = referralCount - currentRank.minReferrals;
  const progress = span > 0 ? filled / span : 0;
  return {
    progress: Math.min(Math.max(progress, 0), 1),
    isTop: false,
  };
}


export function getRankUi(rankId: string): RankUi {
  switch (rankId) {
    case "intern":
      return {
        panelClass: "border border-[var(--border)] bg-[var(--surface-soft)]/70",
        eyebrowClass: "text-[var(--muted)]",
        labelClass: "text-[var(--brand-dark)]",
        metaClass: "text-[var(--muted)]",
        chipClass: "bg-white text-[var(--brand)] ring-1 ring-[var(--border)]",
        chipLabel: "Rising",
      };
    case "fieldAgent":
      return {
        panelClass: "border border-[var(--border)] bg-white shadow-sm",
        eyebrowClass: "text-[var(--muted)]",
        labelClass: "text-[var(--brand-dark)]",
        metaClass: "text-[var(--muted)]",
        chipClass: "bg-[var(--surface-soft)] text-[var(--brand)] ring-1 ring-[var(--border)]",
        chipLabel: "Established",
      };
    case "seniorDiplomat":
      return {
        panelClass: "border border-[var(--accent)]/30 bg-[var(--accent)]/5 shadow-sm",
        eyebrowClass: "text-[var(--accent)]",
        labelClass: "text-[var(--brand-dark)]",
        metaClass: "text-[var(--muted)]",
        chipClass: "bg-white text-[var(--accent)] ring-1 ring-[var(--accent)]/35",
        chipLabel: "Distinguished",
      };
    case "ambassador":
      return {
        panelClass: "border border-[var(--accent)]/40 bg-white shadow-md",
        eyebrowClass: "text-[var(--accent)]",
        labelClass: "text-[var(--brand-dark)]",
        metaClass: "text-[var(--muted)]",
        chipClass: "bg-[var(--accent)]/10 text-[var(--accent)] ring-1 ring-[var(--accent)]/35",
        chipLabel: "Elite",
      };
    case "chiefWhisperer":
      return {
        panelClass: "border border-[var(--accent)] bg-[var(--accent)]/10 shadow-md",
        eyebrowClass: "text-[var(--accent)]",
        labelClass: "text-[var(--brand-dark)]",
        metaClass: "text-[var(--muted)]",
        chipClass: "bg-[var(--accent)] text-white",
        chipLabel: "VIP",
      };
    case "civilian":
    default:
      return {
        panelClass: "border border-[var(--border)] bg-[var(--surface-soft)]/70",
        eyebrowClass: "text-[var(--muted)]",
        labelClass: "text-[var(--brand-dark)]",
        metaClass: "text-[var(--muted)]",
      };
  }
}
