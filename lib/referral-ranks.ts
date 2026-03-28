export interface RankInfo {
  id: string;
  minReferrals: number;
  icon: string;
  label: string;
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
