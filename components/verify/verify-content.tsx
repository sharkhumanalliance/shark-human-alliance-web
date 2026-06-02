"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";
import {
  getCertificateDiplomaticNote,
  getCertificateHumorSeed,
} from "@/lib/certificate-humor";
import { getNextRank, getRankInfo, getRankProgress } from "@/lib/referral-ranks";

type VerifyContentProps = {
  name: string;
  tier: string;
  date: string;
  daysOnFile: number;
  registryId: string;
  referralCode: string;
  referralCount?: number;
  referralSourceCode?: string;
};

function getTierLabel(
  tier: string,
  t: (key: "tierNonsnack" | "tierBusiness" | "tierProtected") => string,
) {
  const normalized = tier?.toLowerCase() ?? "";
  if (normalized === "nonsnack" || normalized.includes("non-snack"))
    return t("tierNonsnack");
  if (normalized === "business" || normalized.includes("zone"))
    return t("tierBusiness");
  return t("tierProtected");
}

function getTierColor(tier: string) {
  const normalized = tier?.toLowerCase() ?? "";
  if (normalized === "nonsnack" || normalized.includes("non-snack"))
    return "var(--tier-nonsnack-text)";
  if (normalized === "business" || normalized.includes("zone"))
    return "var(--tier-business-text)";
  return "var(--tier-protected-text)";
}

function getTierAvatarClass(tier: string) {
  const normalized = tier?.toLowerCase() ?? "";
  if (normalized === "nonsnack" || normalized.includes("non-snack")) {
    return "bg-[var(--tier-nonsnack-surface)] text-[var(--tier-nonsnack-text)] ring-[var(--tier-nonsnack-border)]";
  }
  if (normalized === "business" || normalized.includes("zone")) {
    return "bg-[var(--tier-business-surface)] text-[var(--tier-business-text)] ring-[var(--tier-business-border)]";
  }
  return "bg-[var(--tier-protected-surface)] text-[var(--tier-protected-text)] ring-[var(--tier-protected-border)]";
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SHA";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getQuip(
  registryId: string,
  quips: string[],
) {
  let hash = 0;
  for (let i = 0; i < registryId.length; i++) {
    hash = ((hash << 5) - hash + registryId.charCodeAt(i)) | 0;
  }
  return quips[Math.abs(hash) % quips.length];
}

function hashString(value: string): number {
  let hash = 0;
  const source = value || "default";
  for (let i = 0; i < source.length; i++) {
    hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function FieldIcon({ children }: { children: string }) {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[10px] font-bold text-[var(--brand)]"
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export function VerifyContent({
  name,
  tier,
  date,
  daysOnFile,
  registryId,
  referralCode,
  referralCount,
  referralSourceCode,
}: VerifyContentProps) {
  const locale = useLocale();
  const t = useTranslations("verify");
  const [linkCopied, setLinkCopied] = useState(false);
  const quips = [
    t("quip1"),
    t("quip2"),
    t("quip3"),
    t("quip4"),
    t("quip5"),
    t("quip6"),
    t("quip7"),
    t("quip8"),
    t("quip9"),
    t("quip10"),
    t("quip11"),
    t("quip12"),
    t("quip13"),
  ];
  const tierLabel = getTierLabel(tier, t);
  const tierColor = getTierColor(tier);
  const verificationQuip = getQuip(registryId, quips);
  const bureauConfidence = 82 + (hashString(registryId) % 16);
  const certificateNote = getCertificateDiplomaticNote(
    getCertificateHumorSeed(name, registryId, tier),
    locale,
    tier,
  );
  const rank = getRankInfo(referralCount || 0);
  const referralCountTotal = referralCount || 0;
  const rankNext = getNextRank(referralCountTotal);
  const rankProgress = getRankProgress(referralCountTotal);
  const rankTooltip = rankNext
    ? t("nextRankShort", { count: rankNext.remaining, rank: rankNext.rank.label })
    : t("topRankStatus");
  const purchaseHref = referralSourceCode
    ? `/purchase?tier=protected&ref=${encodeURIComponent(referralSourceCode)}`
    : "/purchase?tier=protected";
  const wantedHref = `/wanted?name=${encodeURIComponent(name)}`;

  function copyVerificationLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }

  return (
    <section data-reveal className="mx-auto max-w-3xl px-4 py-10 sm:px-5 sm:py-12 md:py-24">
      {/* Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-lg sm:p-8">
        <div
          className="pointer-events-none absolute right-4 top-6 rotate-12 rounded-sm border-2 border-orange-500/85 bg-gradient-to-br from-orange-500/12 via-transparent to-orange-700/12 px-8 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.22em] text-orange-700 opacity-92 shadow-md sm:right-6 sm:top-7 sm:px-10 sm:text-sm"
          aria-hidden="true"
        >
          {t("verifiedStamp")}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pr-20 text-center">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={tierColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span
            className="text-xs font-bold uppercase tracking-[0.16em]"
            style={{ color: tierColor }}
          >
            {t("verifiedMember")}
          </span>
        </div>
        <div
          className={`mx-auto mt-6 flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold ring-2 sm:h-28 sm:w-28 sm:text-4xl ${getTierAvatarClass(tier)}`}
          aria-hidden="true"
        >
          {getInitials(name)}
        </div>
        <h1
          className="mt-4 text-center text-3xl font-bold tracking-tight break-words sm:text-4xl"
          style={{ color: "var(--brand-dark)" }}
        >
          {name}
        </h1>

        <p
          className="mt-2 text-center text-base font-semibold sm:text-lg"
          style={{ color: tierColor, fontVariant: "small-caps" }}
        >
          {tierLabel}
        </p>

        <figure className="mx-auto mt-6 max-w-xl px-2 text-center">
          <blockquote className="text-base italic leading-7 text-[var(--brand-dark)] sm:text-lg">
            &ldquo;{verificationQuip}&rdquo;
          </blockquote>
          <figcaption className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            &mdash; {t("quipAttribution")}
          </figcaption>
        </figure>

        <div className="my-6 rounded-2xl border border-[var(--border)] bg-white px-5 py-5 shadow-sm sm:px-6">
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
            <div className="text-center sm:text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                {t("allianceRank")}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[var(--brand-dark)] sm:justify-start">
                <span className="text-2xl" aria-hidden="true">{rank.icon}</span>
                <span className="text-lg font-semibold sm:text-xl">{rank.label}</span>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-4xl font-bold tabular-nums leading-none text-[var(--brand-dark)] sm:text-5xl">
                {referralCountTotal}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)] sm:text-[11px]">
                {referralCount === 1
                  ? t("rankProgressLabelOne")
                  : t("rankProgressLabelOther")}
              </p>
            </div>
          </div>
          <div
            className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--surface-soft)]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(rankProgress.progress * 100)}
            aria-label={rankTooltip}
            title={rankTooltip}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                rankProgress.isTop ? "bg-amber-400" : "bg-[var(--brand)]"
              }`}
              style={{ width: `${Math.round(rankProgress.progress * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-center text-[11px] font-medium text-[var(--muted)] sm:text-right">
            {rankTooltip}
          </p>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
            {t("noteStamp")}
          </div>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            {certificateNote}
          </p>
        </div>

        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="flex gap-3 rounded-xl border border-[var(--border)] bg-white px-3 py-3">
            <FieldIcon>◷</FieldIcon>
            <div>
              <dt className="mb-0.5 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                {t("membershipSince")}
              </dt>
              <dd className="font-semibold leading-6 text-[var(--foreground)]">
                {t("membershipSinceValue", { date, days: daysOnFile })}
              </dd>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-[var(--border)] bg-white px-3 py-3">
            <FieldIcon>#</FieldIcon>
            <div>
              <dt className="mb-0.5 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                {t("registryId")}
              </dt>
              <dd className="break-all font-mono font-semibold leading-6 text-[var(--foreground)]">
                {registryId}
              </dd>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-[var(--border)] bg-white px-3 py-3">
            <FieldIcon>↗</FieldIcon>
            <div>
              <dt className="mb-0.5 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                {t("referralCode")}
              </dt>
              <dd className="break-all font-mono font-semibold leading-6 text-[var(--foreground)]">
                {referralCode}
              </dd>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-[var(--border)] bg-white px-3 py-3">
            <FieldIcon>✓</FieldIcon>
            <div>
              <dt className="mb-0.5 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                {t("fileStatus")}
              </dt>
              <dd className="font-semibold leading-6">
                <span className="text-[var(--brand)]">{t("active")}</span>{" "}
                <span className="text-sm italic text-[var(--muted)]">
                  {t("sharksUnaware")}
                </span>
              </dd>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-[var(--border)] bg-white px-3 py-3">
            <FieldIcon>%</FieldIcon>
            <div>
              <dt className="mb-0.5 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                {t("bureauConfidence")}
              </dt>
              <dd className="font-semibold leading-6 text-[var(--foreground)]">
                {t("bureauConfidenceValue", { confidence: bureauConfidence })}
              </dd>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-soft)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)]"
                  style={{ width: `${bureauConfidence}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-[var(--border)] bg-white px-3 py-3">
            <FieldIcon>~</FieldIcon>
            <div>
              <dt className="mb-0.5 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                {t("uneatenStreak")}
              </dt>
              <dd className="flex items-baseline gap-1.5 font-semibold leading-6 text-[var(--foreground)]">
                <span className="relative inline-flex items-center text-base leading-none" aria-hidden="true">
                  <span>🦈</span>
                  <span className="absolute inset-0 flex items-center justify-center text-red-600/85 text-lg leading-none">⊘</span>
                </span>
                <span>{t("uneatenStreakValue", { days: daysOnFile })}</span>
              </dd>
            </div>
          </div>
        </dl>
      </div>

      {referralSourceCode ? (
        <div className="mt-6 rounded-2xl border border-[color:rgba(16,185,129,0.34)] bg-[color:rgba(16,185,129,0.1)] p-5 text-center shadow-sm ring-1 ring-[color:rgba(16,185,129,0.08)]">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "var(--brand)" }}
          >
            {t("referralCreditActive")}
          </p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-[var(--foreground)]">
            {t("referralBoxText", { name })}
          </p>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <LocalizedLink
          href={wantedHref}
          className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--tier-protected-surface)] px-5 py-3 text-center text-sm font-bold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-[var(--accent)] hover:no-underline"
        >
          {t("wantedPosterAboutMe")}
        </LocalizedLink>
        <button
          type="button"
          onClick={copyVerificationLink}
          className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-[var(--surface-soft)]"
        >
          {linkCopied ? t("copyVerificationLinkCopied") : t("copyVerificationLink")}
        </button>
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-col items-stretch gap-3 sm:items-center">
        <LocalizedLink
          href={purchaseHref}
          className="inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-center text-sm font-bold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-[color:rgba(247,132,59,0.86)] hover:no-underline sm:w-auto"
        >
          {referralSourceCode
            ? t("joinThroughReferral", { name })
            : t("joinAlliance")}
        </LocalizedLink>
        <LocalizedLink
          href="/registry"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand)] transition-colors duration-300 ease-out hover:bg-[var(--surface-soft)] hover:no-underline sm:w-auto"
        >
          {t("viewRegistry")}
        </LocalizedLink>
      </div>

      {/* Disclaimer */}
      <p className="mx-auto mt-6 max-w-md border-t border-[var(--border)] pt-5 text-center text-xs leading-relaxed text-[var(--muted)]">
        {t("disclaimer")}
      </p>
    </section>
  );
}
