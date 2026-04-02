"use client";

import { useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";
import { useState } from "react";
import { trackEvent } from "@/components/analytics";

interface RankInfo {
  name: string;
  referralsNeeded: number;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}

interface ReferralResponse {
  name: string;
  tier: string;
  referralCode: string;
  referralCount: number;
  rank: string;
}

export function CareerContent() {
  const t = useTranslations("career");
  const RANKS: RankInfo[] = [
    {
      name: t("ranks.civilian.name"),
      referralsNeeded: 0,
      icon: "👤",
      color: "text-gray-600",
      bgColor: "bg-gray-50 border-gray-200",
      description: t("ranks.civilian.description"),
    },
    {
      name: t("ranks.probationaryLiaison.name"),
      referralsNeeded: 1,
      icon: "📋",
      color: "text-sky-600",
      bgColor: "bg-sky-50 border-sky-200",
      description: t("ranks.probationaryLiaison.description"),
    },
    {
      name: t("ranks.fieldOperative.name"),
      referralsNeeded: 3,
      icon: "🕵️",
      color: "text-teal-600",
      bgColor: "bg-teal-50 border-teal-200",
      description: t("ranks.fieldOperative.description"),
    },
    {
      name: t("ranks.seniorDiplomat.name"),
      referralsNeeded: 5,
      icon: "🎖️",
      color: "text-orange-600",
      bgColor: "bg-orange-50 border-orange-200",
      description: t("ranks.seniorDiplomat.description"),
    },
    {
      name: t("ranks.specialEnvoy.name"),
      referralsNeeded: 10,
      icon: "🏛️",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 border-indigo-200",
      description: t("ranks.specialEnvoy.description"),
    },
    {
      name: t("ranks.chiefSharkWhisperer.name"),
      referralsNeeded: 25,
      icon: "🦈👑",
      color: "text-amber-600",
      bgColor: "bg-amber-50 border-amber-200",
      description: t("ranks.chiefSharkWhisperer.description"),
    },
  ];
  const [referralCode, setReferralCode] = useState("");
  const [referralData, setReferralData] = useState<ReferralResponse | null>(
    null
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getRankByReferrals = (count: number): RankInfo => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (count >= RANKS[i].referralsNeeded) {
        return RANKS[i];
      }
    }
    return RANKS[0];
  };

  const getNextRank = (currentReferrals: number): RankInfo | null => {
    const nextRank = RANKS.find((r) => r.referralsNeeded > currentReferrals);
    return nextRank || null;
  };

  const handleCheckRank = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setReferralData(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/referral/${referralCode}`);

      if (!response.ok) {
        setError(t("checkRank.notFound"));
        setLoading(false);
        return;
      }

      const data: ReferralResponse = await response.json();
      setReferralData(data);
      trackEvent("rank_lookup", { rank: data.rank, referral_count: data.referralCount, tier: data.tier });
    } catch (err) {
      setError(t("checkRank.error"));
    } finally {
      setLoading(false);
    }
  };

  const currentRank = referralData
    ? getRankByReferrals(referralData.referralCount)
    : null;
  const nextRank = referralData
    ? getNextRank(referralData.referralCount)
    : null;
  const progressPercent =
    currentRank && nextRank
      ? ((referralData!.referralCount - currentRank.referralsNeeded) /
          (nextRank.referralsNeeded - currentRank.referralsNeeded)) *
        100
      : currentRank && !nextRank
        ? 100
        : 0;

  const referralLink = referralData
    ? `${typeof window !== "undefined" ? window.location.origin : ""}?ref=${referralData.referralCode}`
    : "";

  return (
    <>
      {/* Hero Section */}
      <section className="py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("hero.label")}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-3 text-lg leading-7 text-[var(--muted)]">
              {t("hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Career Ladder Section */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("ladder.label")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("ladder.title")}
            </h2>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {RANKS.map((rank) => (
              <article
                key={rank.name}
                className={`rounded-xl border ${rank.bgColor} p-6 shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-5xl`}>{rank.icon}</p>
                    <h3 className="mt-4 text-xl font-semibold text-[var(--brand-dark)]">
                      {rank.name}
                    </h3>
                  </div>
                </div>

                <p className="mt-3 text-sm font-semibold text-[var(--muted)]">
                  {rank.referralsNeeded === 0
                    ? t("ladder.startingRank")
                    : t("ladder.referralsNeeded", {
                        count: rank.referralsNeeded,
                      })}
                </p>

                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                  {rank.description}
                </p>

                {/* Visual progression */}
                <div className="mt-6 flex items-center gap-2">
                  <div className="h-2 flex-grow rounded-full bg-gray-200" />
                  <div className="text-xs font-semibold text-[var(--muted)]">
                    {rank.referralsNeeded}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Check Your Rank Section */}
      <section className="py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="rounded-xl border border-sky-200 bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("checkRank.title")}
            </h2>
            <p className="mt-3 text-base text-[var(--muted)]">
              {t("checkRank.subtitle")}
            </p>

            <form onSubmit={handleCheckRank} className="mt-8 space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-[var(--brand-dark)]">
                  {t("checkRank.codeLabel")}
                </label>
                <input
                  id="code"
                  type="text"
                  placeholder="SHA-XXXX"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="mt-2 w-full rounded-lg border border-sky-200 bg-white px-6 py-3 text-[var(--brand-dark)] placeholder-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !referralCode}
                className="w-full rounded-lg bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white transition disabled:opacity-50 hover:bg-[var(--accent-dark)]"
              >
                {loading ? t("checkRank.loading") : t("checkRank.button")}
              </button>
            </form>

            {error && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {referralData && (
              <div className="mt-8 space-y-6">
                {/* Current Rank Display */}
                <div className="rounded-lg border border-sky-200 bg-white p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-800">
                    {t("checkRank.currentRank")}
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="text-5xl">{currentRank?.icon}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-[var(--brand-dark)]">
                        {currentRank?.name}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {t("checkRank.referralCount", {
                          count: referralData.referralCount,
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress to Next Rank */}
                {nextRank && (
                  <div className="rounded-lg border border-sky-200 bg-white p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-800">
                      {t("checkRank.progressToNext")}
                    </p>
                    <div className="mt-4">
                      <div className="flex items-end justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{nextRank.icon}</span>
                          <span className="font-semibold text-[var(--brand-dark)]">
                            {nextRank.name}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-[var(--muted)]">
                          {nextRank.referralsNeeded -
                            referralData.referralCount}{" "}
                          {t("checkRank.referralsRemaining")}
                        </span>
                      </div>
                      <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-[var(--accent)] transition-all duration-300"
                          style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Referral Link */}
                <div className="rounded-lg border border-sky-200 bg-white p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-800">
                    {t("checkRank.yourLink")}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="flex-grow rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-mono text-[var(--brand-dark)]"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(referralLink);
                      }}
                      className="rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--accent-dark)]"
                    >
                      {t("checkRank.copy")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How Referrals Work Section */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("howWorks.label")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("howWorks.title")}
            </h2>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: "🛡️",
                title: t("howWorks.step1Title"),
                text: t("howWorks.step1Text"),
                borderColor: "border-sky-100",
              },
              {
                step: "02",
                icon: "🔗",
                title: t("howWorks.step2Title"),
                text: t("howWorks.step2Text"),
                borderColor: "border-cyan-100",
              },
              {
                step: "03",
                icon: "📈",
                title: t("howWorks.step3Title"),
                text: t("howWorks.step3Text"),
                borderColor: "border-orange-100",
              },
            ].map((item) => (
              <article
                key={item.step}
                className={`rounded-xl border ${item.borderColor} bg-white p-6 shadow-sm`}
              >
                <div className="text-4xl">{item.icon}</div>
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-sky-800">
                  {item.step}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-[var(--brand-dark)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="pb-16 pt-4">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-xl border border-sky-900/30 bg-[var(--brand-dark)] px-8 py-12 text-white sm:px-12">
            <h2 className="text-3xl font-semibold tracking-tight">
              {t("cta.title")}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-sky-100/80">
              {t("cta.text")}
            </p>
            <div className="mt-6">
              <LocalizedLink
                href="/purchase?tier=protected"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-8 py-4 text-lg font-bold text-white transition hover:bg-[var(--accent-dark)]"
              >
                🚀 {t("cta.button")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
