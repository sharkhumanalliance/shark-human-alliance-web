"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";

type Member = {
  id: string;
  name: string;
  tier: "basic" | "protected" | "nonsnack" | "business";
  date: string;
  dedication: string;
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
    icon: "🚫🍽️",
  },
  business: {
    badge: "bg-indigo-100 text-indigo-800",
    border: "border-indigo-100",
    icon: "🏢",
  },
};

export function RegistryContent() {
  const t = useTranslations("registry");
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState<TierFilter>("all");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => {
        // Sort by date descending (newest first)
        data.sort((a: Member, b: Member) => b.date.localeCompare(a.date));
        setMembers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const copyProfileLink = useCallback((memberId: string) => {
    const url = `${window.location.origin}/registry?highlight=${memberId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(memberId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const filtered = filter === "all"
    ? members
    : members.filter((m) => m.tier === filter);

  // Viral groupings
  const newestDiplomats = members.slice(0, 3);
  const nonSnacks = members.filter((m) => m.tier === "nonsnack");
  const protectedFriends = members.filter((m) => m.tier === "protected");
  const foundingFriends = members.slice(-5).reverse(); // earliest members

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
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-6xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-xl text-[var(--muted)]">
              {t("subtitle")}
            </p>
            <p className="mt-4 text-sm text-[var(--muted)]">
              {t("description")}
            </p>
          </div>

          {/* Counter */}
          {!loading && (
            <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-teal-200 bg-white px-6 py-3 shadow-sm">
              <span className="text-3xl font-semibold text-[var(--brand-dark)]">
                {members.length}
              </span>
              <span className="text-sm text-[var(--muted)]">
                {t("countLabel")}
              </span>
            </div>
          )}

          {/* Filters */}
          <div className="mt-8 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                  filter === f.key
                    ? "bg-[var(--brand-dark)] text-white shadow-md"
                    : "border border-sky-200 bg-white text-[var(--muted)] hover:bg-sky-50 hover:text-[var(--brand-dark)]"
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
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-6">
          {loading ? (
            <div className="py-20 text-center" role="status" aria-live="polite">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-[var(--brand)]" aria-hidden="true" />
              <p className="mt-4 text-sm text-[var(--muted)]">Loading diplomats...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-4xl">🦈</div>
              <p className="mt-6 text-xl font-semibold text-[var(--brand-dark)]">{t("emptyState")}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{t("emptyStateFounders")}</p>
              <a
                href="/purchase?tier=protected"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
              >
                {t("joinCtaButton")}
              </a>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((member) => {
                const style = TIER_STYLES[member.tier];
                return (
                  <article
                    key={member.id}
                    className={`rounded-[2rem] border ${style.border} bg-white p-6 shadow-[0_12px_40px_rgba(25,87,138,0.06)] transition hover:shadow-[0_16px_50px_rgba(25,87,138,0.1)]`}
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
                        onClick={() => copyProfileLink(member.id)}
                        className="shrink-0 rounded-full p-2 text-xs text-[var(--muted)] transition hover:bg-sky-50 hover:text-[var(--brand)]"
                        title={t("copyLink")}
                      >
                        {copiedId === member.id ? "✓" : "🔗"}
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${style.badge}`}
                      >
                        {t(`tierLabels.${member.tier}`)}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {member.id}
                      </span>
                    </div>

                    {member.dedication && (
                      <p className="mt-3 text-sm italic leading-6 text-[var(--muted)]">
                        &ldquo;{member.dedication}&rdquo;
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
                    return (
                      <div key={m.id} className={`flex items-center gap-3 rounded-2xl border ${s.border} bg-white p-4`}>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-soft)] text-sm">
                          {s.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--brand-dark)]">{m.name}</p>
                          <p className="text-xs text-[var(--muted)]">{m.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Officially Not Food */}
            {nonSnacks.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--brand-dark)]">
                  <span className="text-xl">🚫🍽️</span> {t("viralNotFood")}
                </h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{t("viralNotFoodDesc")}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {nonSnacks.map((m) => (
                    <span key={m.id} className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-100 px-4 py-2 text-sm font-medium text-orange-800">
                      🚫🍽️ {m.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Wanted: Still Unprotected */}
            <div className="rounded-[2rem] border-2 border-dashed border-red-200 bg-red-50/30 p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-red-800">
                <span className="text-xl">🚨</span> {t("viralWanted")}
              </h3>
              <p className="mt-2 text-sm leading-6 text-red-700/70">
                {t("viralWantedDesc")}
              </p>
              <a
                href="/purchase?tier=protected&gift=true"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                {t("viralWantedCta")}
              </a>
            </div>

            {/* Founding Friends */}
            {foundingFriends.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--brand-dark)]">
                  <span className="text-xl">⭐</span> {t("viralFounders")}
                </h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{t("viralFoundersDesc")}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-5">
                  {foundingFriends.map((m) => {
                    const s = TIER_STYLES[m.tier];
                    return (
                      <div key={m.id} className="text-center rounded-2xl border border-sky-100 bg-white p-4">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-orange-200 text-sm font-bold text-amber-800">
                          {m.name.charAt(0)}
                        </div>
                        <p className="mt-2 truncate text-sm font-semibold text-[var(--brand-dark)]">{m.name}</p>
                        <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${s.badge}`}>
                          {s.icon}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Join CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-[2.25rem] border border-sky-900/30 bg-[var(--brand-dark)] px-8 py-14 text-center text-white shadow-[0_22px_80px_rgba(15,39,64,0.25)] sm:px-12">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              {t("joinCta")}
            </h2>
            <div className="mt-8">
              <a
                href="/purchase?tier=protected"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/30 transition hover:bg-[var(--accent-dark)] hover:shadow-xl"
              >
                🛡️ {t("joinCtaButton")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-[2rem] border border-sky-100 bg-[var(--surface-soft)] p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("disclaimerTitle")}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
              {t("disclaimerText")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
