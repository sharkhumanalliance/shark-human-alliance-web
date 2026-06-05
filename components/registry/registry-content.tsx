"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";
import { formatCertificateDate } from "@/lib/dates";
import { buildLocalizedPath } from "@/lib/navigation";
import { getNextRank, getRankInfo, getRankProgress } from "@/lib/referral-ranks";
import {
  getPublicTierKey,
  getTierRegistryBadgeClass,
  getTierRegistryBorderClass,
  type PublicTierKey,
  type TierKey,
} from "@/lib/tiers";

type Member = {
  id: string;
  registryCode?: string;
  name: string;
  tier: TierKey;
  date: string;
  dedication: string;
  referralCode?: string;
  referralCount?: number;
};

type TierFilter = "all" | PublicTierKey;

const NEW_MEMBER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const CAREER_STEP_KEYS = ["0", "1", "2", "3", "4", "5"] as const;
const RECRUITER_REWARD_KEYS = ["0", "1", "2", "3"] as const;
const AVATAR_STYLE_BY_TIER: Record<PublicTierKey, string> = {
  protected:
    "bg-[var(--tier-protected-surface)] text-[var(--tier-protected-text)] ring-[var(--tier-protected-border)]",
  nonsnack:
    "bg-[var(--tier-nonsnack-surface)] text-[var(--tier-nonsnack-text)] ring-[var(--tier-nonsnack-border)]",
  business:
    "bg-[var(--tier-business-surface)] text-[var(--tier-business-text)] ring-[var(--tier-business-border)]",
};

function getPublicMemberId(member: Member) {
  return member.registryCode || member.id;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SHA";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getTierAvatarClass(tier: PublicTierKey) {
  return AVATAR_STYLE_BY_TIER[tier];
}

function isNewMember(date: string) {
  const timestamp = Date.parse(date);
  if (!Number.isFinite(timestamp)) return false;
  const age = Date.now() - timestamp;
  return age >= 0 && age <= NEW_MEMBER_WINDOW_MS;
}

function getRecruiterBadge(
  placement: number | undefined,
  referralCount: number
) {
  if (placement === 0) {
    return "border-amber-300 bg-amber-100 text-amber-900";
  }
  if (placement === 1) {
    return "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--brand-dark)]";
  }
  if (placement === 2) {
    return "border-orange-300 bg-orange-100 text-orange-900";
  }
  if (referralCount >= 5) {
    return "border-[var(--accent)]/40 bg-[var(--surface-soft)] text-[var(--brand-dark)]";
  }
  return "";
}

function getRecruiterBadgeLabel(
  placement: number | undefined,
  referralCount: number
) {
  if (placement !== undefined && placement < 3) return `#${placement + 1}`;
  if (referralCount >= 5) return "5+";
  return "";
}

export function RegistryContent() {
  const t = useTranslations("registry");
  const locale = useLocale();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState<TierFilter>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [explainedFilter, setExplainedFilter] = useState<TierFilter>("all");

  useEffect(() => {
    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => {
        data.sort((a: Member, b: Member) => b.date.localeCompare(a.date));
        setMembers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [locale]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredMembers = useMemo(() => {
    let result =
      filter === "all"
        ? members
        : members.filter((member) => getPublicTierKey(member.tier) === filter);

    if (normalizedQuery) {
      result = result.filter((member) => {
        const referral = member.referralCode?.toLowerCase() ?? "";
        return (
          member.name.toLowerCase().includes(normalizedQuery) ||
          referral.includes(normalizedQuery) ||
          getPublicMemberId(member).toLowerCase().includes(normalizedQuery)
        );
      });
    }

    return result;
  }, [filter, members, normalizedQuery]);

  const exactLookupMatch = useMemo(() => {
    if (!normalizedQuery) return null;

    const directMatch = members.find(
      (member) =>
        getPublicMemberId(member).toLowerCase() === normalizedQuery ||
        (member.referralCode && member.referralCode.toLowerCase() === normalizedQuery)
    );

    if (directMatch) return directMatch;

    const exactNameMatches = members.filter(
      (member) => member.name.toLowerCase() === normalizedQuery
    );

    return exactNameMatches.length === 1 ? exactNameMatches[0] : null;
  }, [members, normalizedQuery]);

  const topRecruiters = useMemo(
    () =>
      [...members]
        .filter((member) => (member.referralCount || 0) > 0)
        .sort((a, b) => (b.referralCount || 0) - (a.referralCount || 0))
        .slice(0, 4),
    [members]
  );

  const recruiterPlacementById = useMemo(() => {
    const placements = new Map<string, number>();
    topRecruiters.forEach((member, index) => {
      placements.set(getPublicMemberId(member), index);
    });
    return placements;
  }, [topRecruiters]);

  const protectedCount = members.filter(
    (member) => getPublicTierKey(member.tier) === "protected"
  ).length;
  const nonsnackCount = members.filter(
    (member) => getPublicTierKey(member.tier) === "nonsnack"
  ).length;
  const businessCount = members.filter(
    (member) => getPublicTierKey(member.tier) === "business"
  ).length;

  const filters: { key: TierFilter; label: string; description: string }[] = [
    { key: "all", label: t("filterAll"), description: t("filterAllHint") },
    {
      key: "protected",
      label: t("filterProtected"),
      description: t("filterProtectedHint"),
    },
    {
      key: "nonsnack",
      label: t("filterNonsnack"),
      description: t("filterNonsnackHint"),
    },
    {
      key: "business",
      label: t("filterBusiness"),
      description: t("filterBusinessHint"),
    },
  ];

  const explainedFilterDescription =
    filters.find((item) => item.key === explainedFilter)?.description ??
    filters[0].description;

  const tierSummaryStats = [
    {
      label: t("filterProtected"),
      value: String(protectedCount),
      accent: "text-[var(--tier-protected-text)]",
    },
    {
      label: t("filterNonsnack"),
      value: String(nonsnackCount),
      accent: "text-[var(--tier-nonsnack-text)]",
    },
    {
      label: t("filterBusiness"),
      value: String(businessCount),
      accent: "text-[var(--tier-business-text)]",
    },
  ];
  const wantedPreviewSrc = "/registry-wanted-preview.png";

  const getMemberHref = useCallback(
    (memberId: string) => `/verify?id=${encodeURIComponent(memberId)}`,
    []
  );

  const copyProfileLink = useCallback(
    (memberId: string) => {
      const url = `${window.location.origin}${buildLocalizedPath(locale, getMemberHref(memberId))}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(memberId);
        setTimeout(() => setCopiedId(null), 2000);
      });
    },
    [getMemberHref, locale]
  );

  const copyReferralCode = useCallback((memberId: string, referralCode?: string) => {
    if (!referralCode) return;

    navigator.clipboard.writeText(referralCode).then(() => {
      setCopiedId(`referral:${memberId}`);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const handleOpenRecord = useCallback(() => {
    if (!normalizedQuery) return;

    if (exactLookupMatch) {
      setLookupError("");
      router.push(buildLocalizedPath(locale, getMemberHref(getPublicMemberId(exactLookupMatch))));
      return;
    }

    setLookupError(t("verifyNotFound"));
  }, [exactLookupMatch, getMemberHref, locale, normalizedQuery, router, t]);

  const handleRandomDiplomat = useCallback(() => {
    const candidates = filteredMembers.length > 0 ? filteredMembers : members;
    if (candidates.length === 0) return;
    const member = candidates[Math.floor(Math.random() * candidates.length)];
    setLookupError("");
    router.push(buildLocalizedPath(locale, getMemberHref(getPublicMemberId(member))));
  }, [filteredMembers, getMemberHref, locale, members, router]);

  return (
    <>
      <section data-reveal className="py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
                {t("title")}
              </h1>
              <p className="mt-3 max-w-3xl text-balance text-lg leading-7 text-[var(--muted)]">
                {t("subtitle")}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                {t("description")}
              </p>
            </div>

            {!loading ? (
              <aside className="hidden rounded-[28px] border border-[var(--border)] bg-white px-5 py-5 shadow-sm sm:px-6 lg:block">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    {t("countLabel")}
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] tabular-nums sm:text-4xl">
                    {members.length}
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
                  {tierSummaryStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-[var(--border)] bg-white px-3 py-3"
                    >
                      <p className="flex min-h-[2.25rem] items-start text-[9px] font-semibold uppercase leading-4 tracking-[0.14em] text-[var(--muted)] sm:text-[10px]">
                        {stat.label}
                      </p>
                      <p
                        className={`mt-2 text-xl font-semibold tracking-tight tabular-nums sm:text-2xl ${stat.accent}`}
                      >
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </aside>
            ) : null}
          </div>

          {!loading ? (
            <div className="mt-5 grid grid-cols-4 gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-3 shadow-sm lg:hidden">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {t("mobileStatTotal")}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--brand-dark)]">
                  {members.length}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {t("mobileStatFriends")}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--tier-protected-text)]">
                  {protectedCount}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {t("mobileStatNonsnacks")}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--tier-nonsnack-text)]">
                  {nonsnackCount}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {t("mobileStatZones")}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--tier-business-text)]">
                  {businessCount}
                </p>
              </div>
            </div>
          ) : null}

          <div className="sticky top-[73px] z-20 mt-5 rounded-[24px] border border-[var(--border)] bg-white/95 px-5 py-4 shadow-sm backdrop-blur sm:px-6 lg:static lg:mt-6 lg:bg-white lg:backdrop-blur-none">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="registry-lookup"
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]"
                >
                  {t("verifyTitle")}
                </label>
                <input
                  id="registry-lookup"
                  name="registry_lookup"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setLookupError("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && normalizedQuery) {
                      handleOpenRecord();
                    }
                  }}
                  placeholder={t("searchPlaceholder")}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/55 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                />
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:self-auto">
                <button
                  onClick={handleOpenRecord}
                  disabled={!normalizedQuery}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {t("verifyButton")}
                </button>
                <button
                  type="button"
                  onClick={handleRandomDiplomat}
                  disabled={members.length === 0}
                  className="rounded-lg bg-[var(--brand-dark)] px-4 py-3 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {t("randomDiplomat")}
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  {filters.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      title={item.description}
                      onMouseEnter={() => setExplainedFilter(item.key)}
                      onFocus={() => setExplainedFilter(item.key)}
                      onClick={() => {
                        setFilter(item.key);
                        setExplainedFilter(item.key);
                      }}
                      aria-pressed={filter === item.key}
                      className={`min-h-[44px] rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        filter === item.key
                          ? "bg-[var(--brand-dark)] text-white shadow-sm ring-2 ring-[var(--brand-dark)]/15"
                          : "border border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--brand-dark)]"
                      }`}
                    >
                      {item.label}
                      {item.key !== "all" ? (
                        <span className="ml-1.5 opacity-60 tabular-nums">
                          ({members.filter((member) => getPublicTierKey(member.tier) === item.key).length})
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-sm text-[var(--muted)] lg:pl-4">
                <span className="font-semibold tabular-nums text-[var(--brand-dark)]">
                  {filteredMembers.length}
                </span>{" "}
                {t("countLabel")}
              </p>
            </div>

            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              {explainedFilterDescription}
            </p>

            <div aria-live="polite" className="mt-3 min-h-6">
              {lookupError ? (
                <p className="text-sm text-red-600">{lookupError}</p>
              ) : (
                <p className="text-xs leading-5 text-[var(--muted)]">{t("verifyDescription")}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl px-4 sm:mt-12 sm:px-6">
          {loading ? (
            <div role="status" aria-live="polite" aria-label={t("loadingText")}>
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-2xl border border-[var(--border)] bg-white px-6 py-4"
                  >
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.9fr)_minmax(140px,1fr)_minmax(170px,1.1fr)_minmax(130px,0.9fr)_minmax(170px,1fr)_96px_152px]">
                      <div className="space-y-2">
                        <div className="h-4 w-40 rounded bg-[var(--surface-soft)]" />
                        <div className="h-3 w-28 rounded bg-[var(--surface-soft)]" />
                      </div>
                      <div className="h-6 w-28 rounded-full bg-[var(--surface-soft)]" />
                      <div className="h-4 w-32 rounded bg-[var(--surface-soft)]" />
                      <div className="h-4 w-24 rounded bg-[var(--surface-soft)]" />
                      <div className="h-4 w-28 rounded bg-[var(--surface-soft)]" />
                      <div className="h-4 w-12 rounded bg-[var(--surface-soft)]" />
                      <div className="ml-auto flex gap-2">
                        <div className="h-9 w-16 rounded-lg bg-[var(--surface-soft)]" />
                        <div className="h-9 w-16 rounded-lg bg-[var(--surface-soft)]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                SHA
              </div>
              <p className="mt-4 text-lg font-semibold text-[var(--brand-dark)]">
                {normalizedQuery ? t("searchNoResults") : t("emptyState")}
              </p>
              {!normalizedQuery ? (
                <>
                  <p className="mt-2 text-sm text-[var(--muted)]">{t("emptyStateFounders")}</p>
                  <LocalizedLink
                    href="/purchase?tier=protected"
                    className="mt-6 inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)]"
                  >
                    {t("joinCtaButton")}
                  </LocalizedLink>
                </>
              ) : null}
            </div>
          ) : (
            <>
              <div className="hidden gap-3 md:grid md:grid-cols-1 lg:grid-cols-2">
                {filteredMembers.map((member) => {
                  const publicTier = getPublicTierKey(member.tier);
                  const badgeClass = getTierRegistryBadgeClass(publicTier);
                  const borderClass = getTierRegistryBorderClass(publicTier);
                  const rank = getRankInfo(member.referralCount || 0);
                  const referralCount = member.referralCount || 0;
                  const nextRank = getNextRank(referralCount);
                  const rankProgress = getRankProgress(referralCount);
                  const rankTooltip = nextRank
                    ? t("nextRankShort", {
                        count: nextRank.remaining,
                        rank: nextRank.rank.label,
                      })
                    : t("topRankStatus");
                  const placement = recruiterPlacementById.get(getPublicMemberId(member));
                  const recruiterBadgeClass = getRecruiterBadge(placement, referralCount);
                  const recruiterBadgeLabel = getRecruiterBadgeLabel(placement, referralCount);
                  const publicMemberId = getPublicMemberId(member);
                  const memberHref = getMemberHref(publicMemberId);
                  const memberDate = formatCertificateDate(member.date, locale);
                  const newMember = isNewMember(member.date);

                  return (
                    <article
                      key={publicMemberId}
                      role="link"
                      tabIndex={0}
                      onClick={() =>
                        router.push(buildLocalizedPath(locale, memberHref))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          router.push(buildLocalizedPath(locale, memberHref));
                        }
                      }}
                      className={`group relative cursor-pointer overflow-hidden rounded-[22px] border ${borderClass} bg-white px-5 py-4 shadow-sm transition-colors hover:bg-[var(--surface-soft)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/25`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="relative z-10 flex min-w-0 items-start gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1 ${getTierAvatarClass(publicTier)}`}
                            aria-hidden="true"
                          >
                            {getInitials(member.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2">
                              <p className="truncate text-base font-semibold text-[var(--brand-dark)] transition group-hover:text-[var(--brand)]">
                                {member.name}
                              </p>
                              {newMember ? (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-900">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 motion-safe:animate-pulse" />
                                  {t("newTag")}
                                </span>
                              ) : null}
                              {recruiterBadgeLabel ? (
                                <span
                                  className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${recruiterBadgeClass}`}
                                >
                                  {recruiterBadgeLabel}
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-3 flex min-w-0 flex-col items-start gap-1.5">
                              <span
                                className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${badgeClass}`}
                              >
                                {t(`tierLabels.${publicTier}`)}
                              </span>
                              <span className="text-sm font-medium leading-5 text-[var(--muted)]">
                                {rank.label}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="relative z-10 flex shrink-0 flex-col items-end gap-3">
                          <div className="flex items-center gap-5 text-sm text-[var(--muted)]">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                                {t("memberSince")}
                              </p>
                              <p className="mt-1 whitespace-nowrap">{memberDate}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                                {t("recruitsLabel")}
                              </p>
                              <p className="mt-1 max-w-[11rem] text-sm font-semibold text-[var(--brand-dark)]">
                                {referralCount === 0
                                  ? t("soloOperator")
                                  : referralCount === 1
                                    ? t("firstRecruit")
                                    : t("recruitSummary", {
                                        count: referralCount,
                                      })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                copyProfileLink(publicMemberId);
                              }}
                              aria-label={`${t("copyLink")}: ${member.name}`}
                              className="inline-flex min-h-[44px] items-center rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--muted)] transition-colors duration-300 ease-out hover:bg-[var(--surface-soft)] hover:text-[var(--brand-dark)]"
                            >
                              {copiedId === publicMemberId ? t("copiedShort") : t("copyAction")}
                            </button>
                            <LocalizedLink
                              href={memberHref}
                              className="inline-flex min-h-[44px] items-center rounded-lg bg-[var(--brand)] px-3 py-2 text-xs font-semibold !text-white transition-colors duration-300 ease-out hover:bg-[var(--brand-dark)]"
                              style={{ color: "#ffffff" }}
                            >
                              {t("openAction")}
                            </LocalizedLink>
                          </div>
                        </div>
                      </div>
                      <div className="relative z-10 mt-3 border-t border-[var(--border)] pt-3">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            copyReferralCode(publicMemberId, member.referralCode);
                          }}
                          disabled={!member.referralCode}
                          className="inline-flex min-h-[44px] max-w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-left transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                            {t("referralCodeLabel")}
                          </span>
                          <span className="truncate font-mono text-xs font-semibold text-[var(--brand-dark)]">
                            {member.referralCode || "-"}
                          </span>
                          <span className="shrink-0 text-xs font-bold text-[var(--brand)]">
                            {copiedId === `referral:${publicMemberId}`
                              ? t("copiedShort")
                              : t("copyLinkShort")}
                          </span>
                        </button>
                      </div>
                      <div
                        className="absolute inset-x-0 bottom-0 z-10 h-1 bg-[var(--surface-soft)]"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(rankProgress.progress * 100)}
                        aria-label={rankTooltip}
                        title={rankTooltip}
                      >
                        <div
                          className={`h-full transition-all duration-500 ease-out ${
                            rankProgress.isTop ? "bg-amber-400" : "bg-[var(--brand)]"
                          }`}
                          style={{ width: `${Math.round(rankProgress.progress * 100)}%` }}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="space-y-2 md:hidden">
                {filteredMembers.map((member) => {
                  const publicTier = getPublicTierKey(member.tier);
                  const badgeClass = getTierRegistryBadgeClass(publicTier);
                  const borderClass = getTierRegistryBorderClass(publicTier);
                  const rank = getRankInfo(member.referralCount || 0);
                  const referralCount = member.referralCount || 0;
                  const nextRank = getNextRank(referralCount);
                  const rankProgress = getRankProgress(referralCount);
                  const rankTooltip = nextRank
                    ? t("nextRankShort", {
                        count: nextRank.remaining,
                        rank: nextRank.rank.label,
                      })
                    : t("topRankStatus");
                  const placement = recruiterPlacementById.get(getPublicMemberId(member));
                  const recruiterBadgeClass = getRecruiterBadge(placement, referralCount);
                  const recruiterBadgeLabel = getRecruiterBadgeLabel(placement, referralCount);
                  const publicMemberId = getPublicMemberId(member);
                  const memberHref = getMemberHref(publicMemberId);
                  const memberDate = formatCertificateDate(member.date, locale);
                  const newMember = isNewMember(member.date);

                  return (
                    <article
                      key={publicMemberId}
                      role="link"
                      tabIndex={0}
                      onClick={() =>
                        router.push(buildLocalizedPath(locale, memberHref))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          router.push(buildLocalizedPath(locale, memberHref));
                        }
                      }}
                      className={`relative cursor-pointer overflow-hidden rounded-2xl border ${borderClass} bg-white px-4 py-4 shadow-sm transition hover:bg-[var(--surface-soft)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/25`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ${getTierAvatarClass(publicTier)}`}
                            aria-hidden="true"
                          >
                            {getInitials(member.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2">
                              <p className="truncate text-base font-semibold text-[var(--brand-dark)]">
                                {member.name}
                              </p>
                              {newMember ? (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-900">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 motion-safe:animate-pulse" />
                                  {t("newTag")}
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-xs text-[var(--muted)]">{memberDate}</p>
                          </div>
                        </div>
                        {recruiterBadgeLabel ? (
                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${recruiterBadgeClass}`}
                          >
                            {recruiterBadgeLabel}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${badgeClass}`}
                        >
                          {t(`tierLabels.${publicTier}`)}
                        </span>
                        <span className="inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--brand-dark)]">
                          {rank.label}
                        </span>
                        <span className="inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--brand-dark)]">
                          {referralCount === 0
                            ? t("soloOperator")
                            : referralCount === 1
                              ? t("firstRecruit")
                              : t("recruitSummary", { count: referralCount })}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-col gap-1.5 border-t border-[var(--border)] pt-3">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            copyReferralCode(publicMemberId, member.referralCode);
                          }}
                          disabled={!member.referralCode}
                          className="inline-flex min-h-[44px] max-w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-left transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                            {t("referralCodeLabel")}
                          </span>
                          <span className="truncate font-mono text-xs font-semibold text-[var(--brand-dark)]">
                            {member.referralCode || "-"}
                          </span>
                          <span className="shrink-0 text-xs font-bold text-[var(--brand)]">
                            {copiedId === `referral:${publicMemberId}`
                              ? t("copiedShort")
                              : t("copyLinkShort")}
                          </span>
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              copyProfileLink(publicMemberId);
                          }}
                          aria-label={`${t("copyLink")}: ${member.name}`}
                            className="inline-flex min-h-[44px] items-center rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--muted)] transition-colors duration-300 ease-out hover:bg-[var(--surface-soft)] hover:text-[var(--brand-dark)]"
                          >
                            {copiedId === publicMemberId ? t("copiedShort") : t("copyAction")}
                          </button>
                        <LocalizedLink
                          href={memberHref}
                          className="inline-flex min-h-[44px] items-center rounded-lg bg-[var(--brand)] px-3 py-2 text-xs font-semibold !text-white transition-colors duration-300 ease-out hover:bg-[var(--brand-dark)]"
                          style={{ color: "#ffffff" }}
                        >
                          {t("openAction")}
                        </LocalizedLink>
                        </div>
                      <div
                        className="absolute inset-x-0 bottom-0 h-1 bg-[var(--surface-soft)]"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(rankProgress.progress * 100)}
                        aria-label={rankTooltip}
                        title={rankTooltip}
                      >
                        <div
                          className={`h-full transition-all duration-500 ease-out ${
                            rankProgress.isTop ? "bg-amber-400" : "bg-[var(--brand)]"
                          }`}
                          style={{ width: `${Math.round(rankProgress.progress * 100)}%` }}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {!loading && members.length > 0 ? (
        <section data-reveal className="pb-12">
          <div className="mx-auto max-w-6xl space-y-5 px-4 sm:px-6">
            <section className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-lg font-semibold text-[var(--brand-dark)]">
                {t("viralRecruiters")}
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                {t("viralRecruitersDesc")}
              </p>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {topRecruiters.map((member, index) => {
                  const rank = getRankInfo(member.referralCount || 0);
                  const nextRank = getNextRank(member.referralCount || 0);
                  return (
                    <LocalizedLink
                      key={getPublicMemberId(member)}
                      href={getMemberHref(getPublicMemberId(member))}
                      className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm sm:grid-cols-[minmax(0,1fr)_minmax(170px,0.8fr)] sm:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-dark)] text-lg font-bold text-white tabular-nums">
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--brand-dark)]">
                            {t("viralRecruiterLine", {
                              rank: index + 1,
                              name: member.name,
                              count: member.referralCount || 0,
                            })}
                          </p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {index === 0
                              ? t("viralRecruiterRewardTop")
                              : t(`viralRecruiterRewards.${RECRUITER_REWARD_KEYS[(index - 1) % RECRUITER_REWARD_KEYS.length]}`)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs font-semibold leading-5 text-[var(--brand)] sm:text-right">
                        {nextRank
                          ? t("nextRankShort", {
                              count: nextRank.remaining,
                              rank: nextRank.rank.label,
                            })
                          : t("topRankStatus")}
                        <span className="block text-[var(--muted)]">{rank.label}</span>
                      </p>
                    </LocalizedLink>
                  );
                })}
              </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
                <h2 className="text-lg font-semibold text-red-800">{t("viralWanted")}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {t("viralWantedDesc")}
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <LocalizedLink
                    href="/purchase?tier=protected&gift=true"
                    className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)]"
                  >
                    {t("viralWantedCta")}
                  </LocalizedLink>
                  <LocalizedLink
                    href="/wanted"
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition-colors duration-300 ease-out hover:bg-red-50"
                  >
                    {t("viralWantedPoster")}
                  </LocalizedLink>
                </div>
                <LocalizedLink
                  href="/wanted"
                  aria-label={t("wantedPreviewCta")}
                  className="group/preview relative mt-5 block -rotate-1 overflow-hidden rounded-xl border border-red-100 bg-white shadow-md transition duration-300 ease-out hover:-translate-y-0.5 hover:rotate-0 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <Image
                    src={wantedPreviewSrc}
                    alt={t("wantedPreviewAlt")}
                    width={1200}
                    height={630}
                    className="block aspect-[1200/630] w-full object-cover"
                    loading="lazy"
                    sizes="(min-width: 1024px) 480px, 100vw"
                  />
                  <div className="pointer-events-none absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/45 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover/preview:opacity-100 group-focus-visible/preview:opacity-100">
                    <span className="m-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-red-700 shadow-sm">
                      {t("wantedPreviewCta")} {"→"}
                    </span>
                  </div>
                </LocalizedLink>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
                <h2 className="text-lg font-semibold text-[var(--brand-dark)]">
                  {t("careerPromoTitle")}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {t("careerPromoDesc")}
                </p>
                <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/60 px-4 py-4">
                  <div className="space-y-3">
                    {CAREER_STEP_KEYS.map((stepKey, index) => (
                      <div key={stepKey} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold ${
                              index === CAREER_STEP_KEYS.length - 1
                                ? "border-amber-300 bg-amber-100 text-amber-900"
                                : "border-[var(--brand-dark)] bg-[var(--brand-dark)] text-white"
                            }`}
                          >
                            {index + 1}
                          </div>
                          {index < CAREER_STEP_KEYS.length - 1 ? (
                            <div className="mt-1 h-5 w-px bg-[var(--brand-dark)]/20" />
                          ) : null}
                        </div>
                        <div className="min-w-0 pb-1">
                          <p className="text-sm font-semibold leading-5 text-[var(--brand-dark)]">
                            {t(`careerPromoSteps.${stepKey}.label`)}
                          </p>
                          <p className="text-xs leading-5 text-[var(--muted)]">
                            {t(`careerPromoSteps.${stepKey}.threshold`)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <LocalizedLink
                  href="/career"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
                >
                  {t("careerPromoLink")} {"\u2192"}
                </LocalizedLink>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section data-reveal className="pb-10 pt-2 sm:pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-6 sm:p-8">
            <div className="absolute -right-2 -top-2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--border)] bg-white text-xs font-bold uppercase tracking-wider text-[var(--muted)] shadow-sm sm:-right-3 sm:-top-3 sm:h-16 sm:w-16">
              <span className="rotate-[-12deg] text-center leading-tight">
                SHA
                <br />
                DEPT.
              </span>
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              {t("disclaimerTitle")}
            </p>
            <p className="mt-4 max-w-3xl text-sm italic leading-6 text-[var(--muted)]">
              {t("disclaimerText")}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]/60">
              <span className="inline-block h-px w-8 bg-[var(--border)]" />
              <span className="font-mono uppercase tracking-[0.3em]">{t("disclaimerStamp")}</span>
            </div>
          </div>
        </div>
      </section>

      <section data-reveal className="bg-[#25527f] pb-10 pt-10 sm:pb-16 sm:pt-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="mx-auto max-w-3xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {t("joinCta")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/95 sm:text-base sm:leading-7">
              {t("joinCtaSubtext")}
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-sm">
              {t("joinCtaProof")}
            </p>
            <div className="mt-6 flex justify-center sm:mt-8">
              <LocalizedLink
                href="/purchase?tier=protected"
                className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:min-h-[52px] sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
              >
                {t("joinCtaButton")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
