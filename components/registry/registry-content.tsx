"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";
import { formatCertificateDate } from "@/lib/dates";
import { buildLocalizedPath } from "@/lib/navigation";
import { getRankInfo } from "@/lib/referral-ranks";

type Member = {
  id: string;
  name: string;
  tier: "basic" | "protected" | "nonsnack" | "business";
  date: string;
  dedication: string;
  referralCode?: string;
  referralCount?: number;
};

type TierFilter = "all" | "protected" | "nonsnack" | "business";

const TIER_STYLES: Record<string, { badge: string; border: string }> = {
  basic: {
    badge: "bg-sky-100 text-sky-800",
    border: "border-sky-100",
  },
  protected: {
    badge: "bg-[var(--tier-nonsnack-surface)] text-[var(--tier-nonsnack-text)]",
    border: "border-[var(--tier-nonsnack-border-light)]",
  },
  nonsnack: {
    badge: "bg-[var(--tier-protected-surface)] text-[var(--tier-protected-text)]",
    border: "border-[var(--tier-protected-border-light)]",
  },
  business: {
    badge: "bg-[var(--tier-business-surface)] text-[var(--tier-business-text)]",
    border: "border-[var(--tier-business-border-light)]",
  },
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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
    let result = filter === "all" ? members : members.filter((member) => member.tier === filter);

    if (normalizedQuery) {
      result = result.filter((member) => {
        const referral = member.referralCode?.toLowerCase() ?? "";
        return (
          member.name.toLowerCase().includes(normalizedQuery) ||
          referral.includes(normalizedQuery) ||
          member.id.toLowerCase().includes(normalizedQuery)
        );
      });
    }

    return result;
  }, [filter, members, normalizedQuery]);

  const exactLookupMatch = useMemo(() => {
    if (!normalizedQuery) return null;

    const directMatch = members.find(
      (member) =>
        member.id.toLowerCase() === normalizedQuery ||
        (member.referralCode && member.referralCode.toLowerCase() === normalizedQuery)
    );

    if (directMatch) return directMatch;

    const exactNameMatches = members.filter(
      (member) => member.name.toLowerCase() === normalizedQuery
    );

    return exactNameMatches.length === 1 ? exactNameMatches[0] : null;
  }, [members, normalizedQuery]);

  const newestDiplomats = useMemo(() => members.slice(0, 3), [members]);
  const topRecruiters = useMemo(
    () =>
      [...members]
        .filter((member) => (member.referralCount || 0) > 0)
        .sort((a, b) => (b.referralCount || 0) - (a.referralCount || 0))
        .slice(0, 4),
    [members]
  );

  const protectedCount = members.filter((member) => member.tier === "protected").length;
  const nonsnackCount = members.filter((member) => member.tier === "nonsnack").length;

  const filters: { key: TierFilter; label: string }[] = [
    { key: "all", label: t("filterAll") },
    { key: "protected", label: t("filterProtected") },
    { key: "nonsnack", label: t("filterNonsnack") },
    { key: "business", label: t("filterBusiness") },
  ];

  const summaryStats = [
    { label: t("countLabel"), value: String(members.length), accent: "text-[var(--brand-dark)]" },
    { label: t("filterProtected"), value: String(protectedCount), accent: "text-teal-700" },
    { label: t("filterNonsnack"), value: String(nonsnackCount), accent: "text-orange-700" },
  ];

  const getMemberHref = useCallback(
    (memberId: string) => `/verify?id=${encodeURIComponent(memberId)}`,
    []
  );

  const copyProfileLink = useCallback(
    (memberId: string) => {
      const url = `${window.location.origin}${buildLocalizedPath(locale, `/registry?highlight=${memberId}`)}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(memberId);
        setTimeout(() => setCopiedId(null), 2000);
      });
    },
    [locale]
  );

  const handleOpenRecord = useCallback(() => {
    if (!normalizedQuery) return;

    if (exactLookupMatch) {
      setLookupError("");
      router.push(buildLocalizedPath(locale, getMemberHref(exactLookupMatch.id)));
      return;
    }

    setLookupError(t("verifyNotFound"));
  }, [exactLookupMatch, getMemberHref, locale, normalizedQuery, router, t]);

  return (
    <>
      <section data-reveal className="py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
                {t("title")}
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-7 text-[var(--muted)]">
                {t("subtitle")}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                {t("description")}
              </p>
            </div>

            {!loading ? (
              <aside className="rounded-[28px] border border-[var(--border)] bg-white px-5 py-5 shadow-sm sm:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  {t("countLabel")}
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {summaryStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-4"
                    >
                      <p className="flex min-h-[2.5rem] items-start text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        {stat.label}
                      </p>
                      <p
                        className={`mt-3 text-xl font-semibold tracking-tight tabular-nums sm:text-2xl ${stat.accent}`}
                      >
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </aside>
            ) : null}
          </div>

          <div className="mt-8 rounded-[24px] border border-[var(--border)] bg-white px-5 py-4 shadow-sm sm:px-6">
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
              <button
                onClick={handleOpenRecord}
                disabled={!normalizedQuery}
                className="shrink-0 self-start rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-45 sm:self-auto"
              >
                {t("verifyButton")}
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                {filters.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFilter(item.key)}
                    aria-pressed={filter === item.key}
                    className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                      filter === item.key
                        ? "bg-[var(--brand-dark)] text-white shadow-sm"
                        : "border border-[var(--border)] bg-white text-[var(--muted)] hover:bg-sky-50 hover:text-[var(--brand-dark)]"
                    }`}
                  >
                    {item.label}
                    {item.key !== "all" ? (
                      <span className="ml-1.5 opacity-60 tabular-nums">
                        ({members.filter((member) => member.tier === item.key).length})
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>

              <p className="text-sm text-[var(--muted)] lg:pl-4">
                <span className="font-semibold tabular-nums text-[var(--brand-dark)]">
                  {filteredMembers.length}
                </span>{" "}
                {t("countLabel")}
              </p>
            </div>

            <div aria-live="polite" className="mt-3 min-h-6">
              {lookupError ? (
                <p className="text-sm text-red-600">{lookupError}</p>
              ) : (
                <p className="text-xs leading-5 text-[var(--muted)]">{t("verifyDescription")}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section data-reveal className="py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
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
                        <div className="h-4 w-40 rounded bg-sky-100/80" />
                        <div className="h-3 w-28 rounded bg-sky-50" />
                      </div>
                      <div className="h-6 w-28 rounded-full bg-sky-50" />
                      <div className="h-4 w-32 rounded bg-sky-50" />
                      <div className="h-4 w-24 rounded bg-sky-50" />
                      <div className="h-4 w-28 rounded bg-sky-50" />
                      <div className="h-4 w-12 rounded bg-sky-50" />
                      <div className="ml-auto flex gap-2">
                        <div className="h-9 w-16 rounded-lg bg-sky-50" />
                        <div className="h-9 w-16 rounded-lg bg-sky-100/70" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
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
              <div className="hidden gap-4 md:grid md:grid-cols-1 lg:grid-cols-2">
                {filteredMembers.map((member) => {
                  const style = TIER_STYLES[member.tier];
                  const rank = getRankInfo(member.referralCount || 0);
                  const memberHref = getMemberHref(member.id);
                  const memberDate = formatCertificateDate(member.date, locale);

                  return (
                    <div
                      key={member.id}
                      className="rounded-[22px] border border-[var(--border)] bg-white px-5 py-4 shadow-sm transition-colors hover:bg-sky-50/40"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <LocalizedLink
                            href={memberHref}
                            className="block truncate text-base font-semibold text-[var(--brand-dark)] transition hover:text-[var(--brand)]"
                          >
                            {member.name}
                          </LocalizedLink>
                          <div className="mt-3 flex min-w-0 items-center gap-2 overflow-hidden">
                            <span
                              className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${style.badge}`}
                            >
                              {t(`tierLabels.${member.tier}`)}
                            </span>
                            <span className="truncate whitespace-nowrap text-sm font-medium text-[var(--brand-dark)]">
                              {rank.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-3">
                          <div className="flex items-center gap-5 text-sm text-[var(--muted)]">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
                                {t("memberSince")}
                              </p>
                              <p className="mt-1 whitespace-nowrap">{memberDate}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
                                {t("recruitsLabel")}
                              </p>
                              <p className="mt-1 text-sm font-semibold tabular-nums text-[var(--brand-dark)]">
                                {member.referralCount || 0}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => copyProfileLink(member.id)}
                              aria-label={`${t("copyLink")}: ${member.name}`}
                              className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--muted)] transition-colors duration-300 ease-out hover:bg-white hover:text-[var(--brand-dark)]"
                            >
                              {copiedId === member.id ? t("copiedAction") : t("copyAction")}
                            </button>
                            <LocalizedLink
                              href={memberHref}
                              className="rounded-lg bg-[var(--brand)] px-3 py-2 text-xs font-semibold !text-white transition-colors duration-300 ease-out hover:bg-[var(--brand-dark)]"
                              style={{ color: "#ffffff" }}
                            >
                              {t("openAction")}
                            </LocalizedLink>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3 border-t border-[var(--border)] pt-3">
                        <p className="shrink-0 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--muted)]">
                          {t("referralCodeLabel")}
                        </p>
                        <p className="truncate font-mono text-xs text-[var(--muted)]/80">
                          {member.referralCode || "-"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 md:hidden">
                {filteredMembers.map((member) => {
                  const style = TIER_STYLES[member.tier];
                  const rank = getRankInfo(member.referralCount || 0);
                  const memberHref = getMemberHref(member.id);
                  const memberDate = formatCertificateDate(member.date, locale);

                  return (
                    <article
                      key={member.id}
                      className={`rounded-2xl border ${style.border} bg-white px-4 py-4 shadow-sm`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <LocalizedLink
                            href={memberHref}
                            className="block truncate text-base font-semibold text-[var(--brand-dark)]"
                          >
                            {member.name}
                          </LocalizedLink>
                          <p className="mt-1 text-xs text-[var(--muted)]">{memberDate}</p>
                        </div>
                        <p className="text-right text-xs text-[var(--muted)]">
                          <span className="block font-semibold tabular-nums text-[var(--brand-dark)]">
                            {member.referralCount || 0}
                          </span>
                          {t("viralRecruitersCount")}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${style.badge}`}
                        >
                          {t(`tierLabels.${member.tier}`)}
                        </span>
                        <span className="inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--brand-dark)]">
                          {rank.label}
                        </span>
                      </div>

                      <div className="mt-3 border-t border-[var(--border)] pt-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--muted)]">
                          {t("referralCodeLabel")}
                        </p>
                        <p className="mt-1 truncate font-mono text-xs text-[var(--muted)]/80">
                          {member.referralCode || "-"}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => copyProfileLink(member.id)}
                            aria-label={`${t("copyLink")}: ${member.name}`}
                            className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--muted)] transition-colors duration-300 ease-out hover:bg-sky-50 hover:text-[var(--brand-dark)]"
                          >
                            {copiedId === member.id ? t("copiedAction") : t("copyAction")}
                          </button>
                        <LocalizedLink
                          href={memberHref}
                          className="rounded-lg bg-[var(--brand)] px-3 py-2 text-xs font-semibold !text-white transition-colors duration-300 ease-out hover:bg-[var(--brand-dark)]"
                          style={{ color: "#ffffff" }}
                        >
                          {t("openAction")}
                        </LocalizedLink>
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
        <section data-reveal className="pb-14">
          <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
            <section className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm sm:p-7">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--brand-dark)]">
                    {t("viralNewest")}
                  </h2>
                  <div className="mt-4 space-y-3">
                    {newestDiplomats.map((member) => {
                      const style = TIER_STYLES[member.tier];
                      return (
                        <LocalizedLink
                          key={member.id}
                          href={getMemberHref(member.id)}
                          className={`flex items-center gap-3 rounded-xl border ${style.border} bg-[var(--surface-soft)] px-4 py-3 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-semibold uppercase tracking-[0.08em] text-[var(--brand-dark)]">
                            {getInitials(member.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[var(--brand-dark)]">
                              {member.name}
                            </p>
                            <p className="text-xs text-[var(--muted)]">
                              {formatCertificateDate(member.date, locale)}
                            </p>
                          </div>
                        </LocalizedLink>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-[var(--border)] pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                  <h2 className="text-lg font-semibold text-[var(--brand-dark)]">
                    {t("viralRecruiters")}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    {t("viralRecruitersDesc")}
                  </p>
                  <div className="mt-4 space-y-3">
                    {topRecruiters.map((member, index) => {
                      const rank = getRankInfo(member.referralCount || 0);
                      return (
                        <LocalizedLink
                          key={member.id}
                          href={getMemberHref(member.id)}
                          className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-dark)] text-sm font-bold text-white tabular-nums">
                            #{index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[var(--brand-dark)]">
                              {member.name}
                            </p>
                            <p className="text-xs text-[var(--muted)]">
                              {member.referralCount} {t("viralRecruitersCount")} - {rank.label}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs font-semibold text-[var(--brand)]">
                            {t("viralRecruitersRank")}
                          </span>
                        </LocalizedLink>
                      );
                    })}
                  </div>
                </div>
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
                    className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-red-700"
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
              </div>

              <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/60 to-white p-6">
                <h2 className="text-lg font-semibold text-[var(--brand-dark)]">
                  {t("careerPromoTitle")}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {t("careerPromoDesc")}
                </p>
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
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
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

      <section data-reveal className="bg-[#25527f] pb-16 pt-14 sm:pt-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t("joinCta")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-white/95">
              {t("joinCtaSubtext")}
            </p>
            <div className="mt-8 flex justify-center">
              <LocalizedLink
                href="/purchase?tier=protected"
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-4 text-base font-bold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:w-auto sm:px-8 sm:text-lg"
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
