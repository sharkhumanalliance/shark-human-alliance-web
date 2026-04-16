"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";
import { trackEvent } from "@/components/analytics";

interface RankInfo {
  name: string;
  referralsNeeded: number;
  icon: string;
  color: string;
  borderClass: string;
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
      icon: "01",
      color: "text-slate-500",
      borderClass: "border-slate-200",
      description: t("ranks.civilian.description"),
    },
    {
      name: t("ranks.probationaryLiaison.name"),
      referralsNeeded: 1,
      icon: "02",
      color: "text-sky-600",
      borderClass: "border-sky-200",
      description: t("ranks.probationaryLiaison.description"),
    },
    {
      name: t("ranks.fieldOperative.name"),
      referralsNeeded: 3,
      icon: "03",
      color: "text-teal-600",
      borderClass: "border-teal-200",
      description: t("ranks.fieldOperative.description"),
    },
    {
      name: t("ranks.seniorDiplomat.name"),
      referralsNeeded: 5,
      icon: "04",
      color: "text-orange-600",
      borderClass: "border-orange-200",
      description: t("ranks.seniorDiplomat.description"),
    },
    {
      name: t("ranks.specialEnvoy.name"),
      referralsNeeded: 10,
      icon: "05",
      color: "text-indigo-600",
      borderClass: "border-indigo-200",
      description: t("ranks.specialEnvoy.description"),
    },
    {
      name: t("ranks.chiefSharkWhisperer.name"),
      referralsNeeded: 25,
      icon: "06",
      color: "text-amber-600",
      borderClass: "border-amber-200",
      description: t("ranks.chiefSharkWhisperer.description"),
    },
  ];

  const [referralCode, setReferralCode] = useState("");
  const [referralData, setReferralData] = useState<ReferralResponse | null>(null);
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
    const nextRank = RANKS.find((rank) => rank.referralsNeeded > currentReferrals);
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
      trackEvent("rank_lookup", {
        rank: data.rank,
        referral_count: data.referralCount,
        tier: data.tier,
      });
    } catch {
      setError(t("checkRank.error"));
    } finally {
      setLoading(false);
    }
  };

  const currentRank = referralData ? getRankByReferrals(referralData.referralCount) : null;
  const nextRank = referralData ? getNextRank(referralData.referralCount) : null;
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

  const howItWorksItems = [
    {
      step: "01",
      title: t("howWorks.step1Title"),
      text: t("howWorks.step1Text"),
    },
    {
      step: "02",
      title: t("howWorks.step2Title"),
      text: t("howWorks.step2Text"),
    },
    {
      step: "03",
      title: t("howWorks.step3Title"),
      text: t("howWorks.step3Text"),
    },
  ];

  return (
    <>
      <section data-reveal className="py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("hero.label")}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-7 text-[var(--muted)]">
              {t("hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LocalizedLink
                href="/purchase?tier=protected"
                className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-[var(--accent)] px-6 py-4 text-base font-bold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:px-8"
              >
                {t("cta.button")}
              </LocalizedLink>
              <a
                href="#career-rank-check"
                className="inline-flex min-h-[52px] items-center justify-center rounded-lg border border-[var(--border)] bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-sky-50"
              >
                {t("checkRank.button")}
              </a>
            </div>
          </div>

          <div className="mt-10 border-t border-[var(--border)] pt-6">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                {t("ladder.label")}
              </p>
              <div className="mt-4 space-y-4">
                {RANKS.map((rank) => (
                  <div
                    key={rank.name}
                    className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4"
                  >
                    <div className="flex min-w-0 gap-3">
                      <span
                        className={`w-10 shrink-0 pt-0.5 text-right text-2xl font-light tabular-nums ${rank.color}`}
                      >
                        {rank.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--brand-dark)]">
                          {rank.name}
                        </p>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                          {rank.description}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 pl-4 text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        {t("ladder.unlocksAt")}
                      </p>
                      <span className="mt-1 block text-sm font-semibold tabular-nums text-[var(--brand-dark)]">
                        {rank.referralsNeeded}+
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="career-rank-check" data-reveal className="py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-[28px] border border-sky-200 bg-gradient-to-br from-sky-50/70 via-white to-white shadow-sm">
            <div className="border-b border-sky-100 bg-sky-50/80 px-5 py-3 sm:px-8">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-sky-500">
                {t("checkRank.terminalLabel")}
              </span>
            </div>

            <div className="px-5 py-6 sm:px-8 sm:py-8">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-start">
                <div className="max-w-md">
                  <h2 className="text-3xl font-semibold tracking-tight text-[var(--brand-dark)]">
                    {t("checkRank.title")}
                  </h2>
                  <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                    {t("checkRank.subtitle")}
                  </p>
                </div>

                <form onSubmit={handleCheckRank} className="space-y-4">
                  <div>
                    <label
                      htmlFor="code"
                      className="block text-sm font-medium text-[var(--brand-dark)]"
                    >
                      {t("checkRank.codeLabel")}
                    </label>
                    <input
                      id="code"
                      name="referral_code"
                      type="text"
                      placeholder="SHA-XXXX"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      className="mt-2 w-full rounded-lg border border-sky-200 bg-white px-5 py-3 text-[var(--brand-dark)] placeholder-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !referralCode}
                    className="w-full rounded-lg bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] disabled:opacity-50"
                  >
                    {loading ? t("checkRank.loading") : t("checkRank.button")}
                  </button>
                </form>
              </div>

              {error ? (
                <div
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="status"
                  aria-live="polite"
                >
                  {error}
                </div>
              ) : null}

              {referralData ? (
                <div
                  className="mt-8 grid gap-4 border-t border-[var(--border)] pt-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
                  role="status"
                  aria-live="polite"
                >
                  <section className="rounded-2xl border border-sky-200 bg-white px-5 py-5 sm:px-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-800">
                      {t("checkRank.currentRank")}
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className={`text-5xl font-light ${currentRank?.color}`}>{currentRank?.icon}</div>
                      <div>
                        <h3 className="text-2xl font-semibold text-[var(--brand-dark)]">
                          {currentRank?.name}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {t("checkRank.referralCount", {
                            count: referralData.referralCount,
                          })}
                        </p>
                      </div>
                    </div>
                  </section>

                  <div className="space-y-4">
                    {nextRank ? (
                      <section className="rounded-2xl border border-sky-200 bg-white px-5 py-5 sm:px-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-800">
                              {t("checkRank.progressToNext")}
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                              <span className={`text-3xl font-light ${nextRank.color}`}>{nextRank.icon}</span>
                              <span className="font-semibold text-[var(--brand-dark)]">
                                {nextRank.name}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-[var(--muted)]">
                            {nextRank.referralsNeeded - referralData.referralCount}{" "}
                            {t("checkRank.referralsRemaining")}
                          </span>
                        </div>
                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-sky-100">
                          <div
                            className="h-full bg-[var(--accent)] transition-all duration-300"
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                          />
                        </div>
                      </section>
                    ) : null}

                    <section className="rounded-2xl border border-sky-200 bg-white px-5 py-5 sm:px-6">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-800">
                        {t("checkRank.yourLink")}
                      </p>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={referralLink}
                          readOnly
                          className="flex-grow rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-mono text-[var(--brand-dark)] sm:min-w-0"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(referralLink);
                          }}
                          className="min-h-[48px] rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:shrink-0"
                        >
                          {t("checkRank.copy")}
                        </button>
                      </div>
                    </section>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section data-reveal className="py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("howWorks.label")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("howWorks.title")}
            </h2>
          </div>

          <div className="mt-8 overflow-hidden rounded-[28px] border border-[var(--border)] bg-white">
            <div className="grid md:grid-cols-3">
              {howItWorksItems.map((item, index) => (
                <article
                  key={item.step}
                  className={`px-6 py-6 sm:px-7 ${
                    index > 0 ? "border-t border-[var(--border)] md:border-l md:border-t-0" : ""
                  }`}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
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
        </div>
      </section>

      <section data-reveal className="bg-[#25527f] pb-16 pt-14 sm:pt-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-white/95">
              {t("cta.text")}
            </p>
            <div className="mt-8 flex justify-center">
              <LocalizedLink
                href="/purchase?tier=protected"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[var(--accent)] px-6 py-4 text-base font-bold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:w-auto sm:px-8 sm:text-lg"
              >
                {t("cta.button")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
