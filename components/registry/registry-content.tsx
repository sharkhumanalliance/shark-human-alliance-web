"use client";

import { useLocale, useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";
import { buildLocalizedPath } from "@/lib/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RANKS, getRankInfo } from "@/lib/referral-ranks";

type Member = {
  id: string;
  name: string;
  tier: "basic" | "protected" | "nonsnack" | "business";
  date: string;
  dedication: string;
  referralCode?: string;
  referralCount?: number;
};

type TierFilter = "all" | "basic" | "protected" | "nonsnack" | "business";

const TIER_STYLES: Record<string, { badge: string; border: string; icon: string }> = {
  basic: {
    badge: "bg-sky-100 text-sky-800",
    border: "border-sky-100",
    icon: "🐟",
  },
  protected: {
    badge: "bg-teal-100 text-teal-800",
    border: "border-teal-100",
    icon: "🛡️",
  },
  nonsnack: {
    badge: "bg-orange-100 text-orange-800",
    border: "border-orange-100",
    icon: "🚫",
  },
  business: {
    badge: "bg-indigo-100 text-indigo-800",
    border: "border-indigo-100",
    icon: "🏢",
  },
};

export function RegistryContent() {
  const t = useTranslations("registry");
  const locale = useLocale();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState<TierFilter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);

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

  const copyProfileLink = useCallback((memberId: string) => {
    const url = `${window.location.origin}${buildLocalizedPath(locale, `/registry?highlight=${memberId}`)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(memberId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const openMember = useCallback((memberId: string) => {
    router.push(buildLocalizedPath(locale, `/verify?id=${encodeURIComponent(memberId)}`));
  }, [router, locale]);

  const handleVerify = useCallback(async () => {
    const q = verifyInput.trim();
    if (!q) return;
    setVerifyError("");
    setVerifying(true);
    try {
      // Try to find the member — first check if input looks like a member ID (m-...)
      // or search by referral code (SHA-...)
      const res = await fetch("/api/members");
      const data: Member[] = await res.json();
      const match = data.find(
        (m) =>
          m.id.toLowerCase() === q.toLowerCase() ||
          (m.referralCode && m.referralCode.toLowerCase() === q.toLowerCase())
      );
      if (match) {
        router.push(buildLocalizedPath(locale, `/verify?id=${encodeURIComponent(match.id)}`));
      } else {
        setVerifyError(t("verifyNotFound"));
      }
    } catch {
      setVerifyError(t("verifyError"));
    } finally {
      setVerifying(false);
    }
  }, [locale, verifyInput, router, t]);

  const filtered = useMemo(() => {
    let result = filter === "all" ? members : members.filter((m) => m.tier === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.referralCode && m.referralCode.toLowerCase().includes(q)) ||
          m.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [members, filter, search]);

  // Viral groupings
  const newestDiplomats = members.slice(0, 3);
  const topRecruiters = [...members]
    .filter((m) => (m.referralCount || 0) > 0)
    .sort((a, b) => (b.referralCount || 0) - (a.referralCount || 0))
    .slice(0, 5);

  const filters: { key: TierFilter; label: string }[] = [
    { key: "all", label: t("filterAll") },
    { key: "basic", label: t("filterBasic") },
    { key: "protected", label: t("filterProtected") },
    { key: "nonsnack", label: t("filterNonsnack") },
    { key: "business", label: t("filterBusiness") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-3 text-lg text-[var(--muted)]">
              {t("subtitle")}
            </p>
            <p className="mt-4 text-sm text-[var(--muted)]">
              {t("description")}
            </p>
            <p className="mt-2 text-xs font-medium text-[var(--muted)]/80">
              {t("clickHint")}
            </p>
          </div>

          {/* Counter */}
          {!loading && (
            <div className="mt-10 inline-flex items-center gap-3 rounded-lg border border-[var(--border)] bg-white px-6 py-3 shadow-sm">
              <span className="text-3xl font-semibold text-[var(--brand-dark)]">
                {members.length}
              </span>
              <span className="text-sm text-[var(--muted)]">
                {t("countLabel")}
              </span>
            </div>
          )}

          {/* Verify Certificate */}
          <div className="mt-10 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/60 to-white p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-lg">
                ✅
              </div>
              <div className="min-w-0 flex-grow">
                <h3 className="text-base font-semibold text-[var(--brand-dark)]">
                  {t("verifyTitle")}
                </h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {t("verifyDescription")}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <div className="relative min-w-0 flex-grow">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]" aria-hidden="true">🔎</span>
                <input
                  type="text"
                  value={verifyInput}
                  onChange={(e) => { setVerifyInput(e.target.value); setVerifyError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && verifyInput.trim()) handleVerify(); }}
                  placeholder={t("verifyPlaceholder")}
                  className="w-full rounded-lg border border-teal-200 bg-white py-3 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={!verifyInput.trim() || verifying}
                className="shrink-0 rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {verifying ? t("verifyLoading") : t("verifyButton")}
              </button>
            </div>
            {verifyError && (
              <div className="mt-3">
                <p className="text-sm text-red-600">{verifyError}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <LocalizedLink
                    href="/purchase?tier=protected"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--accent-dark)]"
                  >
                    🛡️ {t("verifyBuyCta")}
                  </LocalizedLink>
                  <LocalizedLink
                    href="/wanted"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                  >
                    🚨 {t("verifyWantedCta")}
                  </LocalizedLink>
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="relative max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-[var(--muted)]" aria-hidden="true">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full rounded-lg border border-[var(--border)] bg-white py-3 pl-11 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
                  filter === f.key
                    ? "bg-[var(--brand-dark)] text-white shadow-md"
                    : "border border-[var(--border)] bg-white text-[var(--muted)] hover:bg-sky-50 hover:text-[var(--brand-dark)]"
                }`}
              >
                {f.label}
                {f.key !== "all" && (
                  <span className="ml-1.5 opacity-60">
                    ({members.filter((m) => f.key === "all" || m.tier === f.key).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Members grid */}
      <section className="pb-14">
        <div className="mx-auto max-w-6xl px-6">
          {loading ? (
            <div className="py-14 text-center" role="status" aria-live="polite">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-[var(--brand)]" aria-hidden="true" />
              <p className="mt-4 text-sm text-[var(--muted)]">{t("loadingText")}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-3xl">🦈</div>
              <p className="mt-4 text-lg font-semibold text-[var(--brand-dark)]">
                {search.trim() ? t("searchNoResults") : t("emptyState")}
              </p>
              {!search.trim() && (
                <>
                  <p className="mt-2 text-sm text-[var(--muted)]">{t("emptyStateFounders")}</p>
                  <LocalizedLink
                    href="/purchase?tier=protected"
                    className="mt-6 inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
                  >
                    {t("joinCtaButton")}
                  </LocalizedLink>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((member) => {
                const style = TIER_STYLES[member.tier];
                const rank = getRankInfo(member.referralCount || 0);
                return (
                  <article
                    key={member.id}
                    onClick={() => openMember(member.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openMember(member.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`cursor-pointer rounded-xl border ${style.border} bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-lg">
                          {style.icon}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-[var(--brand-dark)]">
                            {member.name}
                          </p>
                          <p className="text-xs text-[var(--muted)]">
                            {t("memberSince")} {member.date}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); copyProfileLink(member.id); }}
                        className="shrink-0 rounded-full p-2 text-xs text-[var(--muted)] transition hover:bg-sky-50 hover:text-[var(--brand)]"
                        title={t("copyLink")}
                      >
                        {copiedId === member.id ? "✓" : "🔗"}
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${style.badge}`}
                      >
                        {t(`tierLabels.${member.tier}`)}
                      </span>
                      {/* Rank badge */}
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
                        <span>{rank.icon}</span>
                        <span>{rank.label}</span>
                      </span>
                    </div>

                    {member.dedication && (
                      <p className="mt-3 text-sm italic leading-6 text-[var(--muted)]">
                        &ldquo;{member.dedication}&rdquo;
                      </p>
                    )}

                    {member.referralCode && (
                      <p className="mt-2 text-xs font-mono text-[var(--muted)]/60">
                        {member.referralCode}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Viral sections — only shown when members exist */}
      {!loading && members.length > 0 && (
        <section className="pb-16">
          <div className="mx-auto max-w-6xl px-6 space-y-12">
            {/* Newest Diplomats */}
            {newestDiplomats.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--brand-dark)]">
                  <span className="text-xl">🆕</span> {t("viralNewest")}
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {newestDiplomats.map((m) => {
                    const s = TIER_STYLES[m.tier];
                    const rank = getRankInfo(m.referralCount || 0);
                    return (
                      <div key={m.id} onClick={() => openMember(m.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openMember(m.id); } }} className={`flex cursor-pointer items-center gap-3 rounded-xl border ${s.border} bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20`}>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-soft)] text-sm">
                          {s.icon}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <p className="truncate text-sm font-semibold text-[var(--brand-dark)]">{m.name}</p>
                          <p className="text-xs text-[var(--muted)]">{m.date}</p>
                        </div>
                        <span className="shrink-0 text-sm" title={rank.label}>{rank.icon}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Wanted: Still Unprotected */}
            <div className="rounded-xl border border-dashed border-red-200 bg-red-50/30 p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-red-800">
                <span className="text-xl">🚨</span> {t("viralWanted")}
              </h3>
              <p className="mt-2 text-sm leading-6 text-red-700/70">
                {t("viralWantedDesc")}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <LocalizedLink
                  href="/purchase?tier=protected&gift=true"
                  className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  {t("viralWantedCta")}
                </LocalizedLink>
                <LocalizedLink
                  href="/wanted"
                  className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  🚨 {t("viralWantedPoster")}
                </LocalizedLink>
              </div>
            </div>

            {/* Top Recruiters — VIP */}
            {topRecruiters.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-gradient-to-b from-amber-50/50 to-white p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-amber-800">
                  <span className="text-xl">🏆</span> {t("viralRecruiters")}
                </h3>
                <p className="mt-1 text-sm text-amber-700/70">{t("viralRecruitersDesc")}</p>
                <div className="mt-4 space-y-3">
                  {topRecruiters.map((m, idx) => {
                    const rank = getRankInfo(m.referralCount || 0);
                    return (
                      <div key={m.id} onClick={() => openMember(m.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openMember(m.id); } }} className="flex cursor-pointer items-center gap-4 rounded-xl border border-amber-100 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-300 text-sm font-bold text-white">
                          #{idx + 1}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <p className="truncate text-sm font-semibold text-[var(--brand-dark)]">{m.name}</p>
                          <p className="text-xs text-[var(--muted)]">
                            {m.referralCount} {t("viralRecruitersCount")} · {rank.icon} {rank.label}
                          </p>
                        </div>
                        <LocalizedLink
                          href="/career"
                          className="shrink-0 text-xs font-semibold text-amber-700 hover:text-amber-900"
                        >
                          {t("viralRecruitersRank")} →
                        </LocalizedLink>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Career ladder promo */}
            <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50/60 to-white p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-2xl">
                  🎖️
                </div>
                <div className="min-w-0 flex-grow">
                  <h3 className="text-lg font-semibold text-[var(--brand-dark)]">
                    {t("careerPromoTitle")}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    {t("careerPromoDesc")}
                  </p>
                  <LocalizedLink
                    href="/career"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
                  >
                    {t("careerPromoLink")} →
                  </LocalizedLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Join CTA */}
      <section className="pb-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-xl border border-sky-900/30 bg-[var(--brand-dark)] px-8 py-10 text-center text-white sm:px-12">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              {t("joinCta")}
            </h2>
            <div className="mt-8">
              <LocalizedLink
                href="/purchase?tier=protected"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-8 py-4 text-lg font-bold text-white transition hover:bg-[var(--accent-dark)]"
              >
                🛡️ {t("joinCtaButton")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="pb-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("disclaimerTitle")}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              {t("disclaimerText")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
