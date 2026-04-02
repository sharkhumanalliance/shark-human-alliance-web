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
  { id: "civilian", minReferrals: 0, icon: "👤", label: "Civilian" },
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
  const currentRankId = getRank(referralCount);

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


export function getRankUi(rankId: string): RankUi {
  switch (rankId) {
    case "intern":
      return {
        panelClass: "border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50",
        eyebrowClass: "text-sky-700/80",
        labelClass: "text-[var(--brand-dark)]",
        metaClass: "text-sky-700/80",
        chipClass: "bg-sky-100 text-sky-800",
        chipLabel: "Rising",
      };
    case "fieldAgent":
      return {
        panelClass: "border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-cyan-50 shadow-sm",
        eyebrowClass: "text-teal-700/80",
        labelClass: "text-[var(--brand-dark)]",
        metaClass: "text-teal-700/80",
        chipClass: "bg-teal-100 text-teal-800",
        chipLabel: "Established",
      };
    case "seniorDiplomat":
      return {
        panelClass: "border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-sm",
        eyebrowClass: "text-amber-700/80",
        labelClass: "text-[var(--brand-dark)]",
        metaClass: "text-amber-700/80",
        chipClass: "bg-amber-100 text-amber-800",
        chipLabel: "Distinguished",
      };
    case "ambassador":
      return {
        panelClass: "border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 shadow-md",
        eyebrowClass: "text-violet-700/80",
        labelClass: "text-violet-950",
        metaClass: "text-violet-700/80",
        chipClass: "bg-violet-100 text-violet-800",
        chipLabel: "Elite",
      };
    case "chiefWhisperer":
      return {
        panelClass: "border border-amber-300 bg-gradient-to-br from-amber-100 via-white to-yellow-50 shadow-md",
        eyebrowClass: "text-amber-800/90",
        labelClass: "text-amber-950",
        metaClass: "text-amber-800/90",
        chipClass: "bg-amber-200 text-amber-900",
        chipLabel: "VIP",
      };
    case "civilian":
    default:
      return {
        panelClass: "border border-slate-200 bg-slate-50/70",
        eyebrowClass: "text-slate-500",
        labelClass: "text-slate-700",
        metaClass: "text-slate-500",
      };
  }
}
