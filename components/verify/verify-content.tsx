"use client";

import { useLocale, useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";
import {
  getCertificateDiplomaticNote,
  getCertificateHumorSeed,
} from "@/lib/certificate-humor";
import { getRankInfo, getRankUi } from "@/lib/referral-ranks";

type VerifyContentProps = {
  name: string;
  tier: string;
  date: string;
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
    return "#b85c1a";
  if (normalized === "business" || normalized.includes("zone"))
    return "#5b3fa0";
  return "#1a7a6d";
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

export function VerifyContent({
  name,
  tier,
  date,
  registryId,
  referralCode,
  referralCount,
  referralSourceCode,
}: VerifyContentProps) {
  const locale = useLocale();
  const t = useTranslations("verify");
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
  ];
  const tierLabel = getTierLabel(tier, t);
  const tierColor = getTierColor(tier);
  const verificationQuip = getQuip(registryId, quips);
  const certificateNote = getCertificateDiplomaticNote(
    getCertificateHumorSeed(name, registryId, tier),
    locale,
    tier,
  );
  const rank = getRankInfo(referralCount || 0);
  const rankUi = getRankUi(rank.id);
  const purchaseHref = referralSourceCode
    ? `/purchase?tier=protected&ref=${encodeURIComponent(referralSourceCode)}`
    : "/purchase?tier=protected";

  return (
    <section data-reveal className="mx-auto max-w-xl px-4 py-10 sm:px-5 sm:py-12 md:py-24">
      {/* Badge */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-center">
        <svg
          width="28"
          height="28"
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
          className="text-sm font-bold uppercase tracking-wider"
          style={{ color: tierColor }}
        >
          {t("verifiedMember")}
        </span>
      </div>
      <p
        className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: tierColor }}
      >
        {verificationQuip}
      </p>

      {/* Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-lg sm:p-8">
        <h1
          className="mb-1 text-center text-xl font-bold break-words sm:text-2xl"
          style={{ color: "var(--brand-dark)" }}
        >
          {name}
        </h1>

        <p
          className="mb-6 text-center text-base font-semibold sm:text-lg"
          style={{ color: tierColor, fontVariant: "small-caps" }}
        >
          {tierLabel}
        </p>

        <div className={`mb-6 rounded-2xl p-4 text-center sm:p-5 ${rankUi.panelClass}`}>
          <div className="flex items-center justify-center gap-2">
            <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${rankUi.eyebrowClass}`}>
              {t("allianceRank")}
            </p>
            {rankUi.chipLabel ? (
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${rankUi.chipClass}`}>
                {rankUi.chipLabel}
              </span>
            ) : null}
          </div>
          <div className={`mt-2 flex flex-wrap items-center justify-center gap-2 ${rankUi.labelClass}`}>
            <span className="text-2xl" aria-hidden="true">{rank.icon}</span>
            <span className="text-lg font-semibold">{rank.label}</span>
          </div>
          <p className={`mt-2 text-xs ${rankUi.metaClass}`}>
            {t("rankProgress", { count: referralCount || 0 })}
          </p>
        </div>

        <div className="mb-6 rounded-xl bg-[var(--surface-soft)] p-5">
          <p
            className="text-center text-sm leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            {certificateNote}
          </p>
        </div>

        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt
              className="mb-0.5 text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--muted)" }}
            >
              {t("membershipSince")}
            </dt>
            <dd style={{ color: "var(--foreground)" }} className="font-semibold">
              {date}
            </dd>
          </div>
          <div>
            <dt
              className="mb-0.5 text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--muted)" }}
            >
              {t("registryId")}
            </dt>
            <dd
              style={{ color: "var(--foreground)" }}
              className="font-mono font-semibold break-all"
            >
              {registryId}
            </dd>
          </div>
          <div>
            <dt
              className="mb-0.5 text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--muted)" }}
            >
              {t("referralCode")}
            </dt>
            <dd
              style={{ color: "var(--foreground)" }}
              className="font-mono font-semibold break-all"
            >
              {referralCode}
            </dd>
          </div>
          <div>
            <dt
              className="mb-0.5 text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--muted)" }}
            >
              {t("diplomaticStatus")}
            </dt>
            <dd style={{ color: tierColor }} className="font-semibold">
              {t("active")}
            </dd>
          </div>
        </dl>
      </div>

      {/* Disclaimer */}
      <p
        className="mx-auto mt-6 max-w-md text-center text-xs leading-relaxed"
        style={{ color: "var(--muted)" }}
      >
        {t("disclaimer")}
      </p>

      {referralSourceCode ? (
        <div className="mt-8 rounded-2xl border border-[color:rgba(16,185,129,0.24)] bg-[color:rgba(16,185,129,0.08)] p-4 text-center shadow-sm sm:p-5">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.24em]"
            style={{ color: "var(--brand)" }}
          >
            {t("referralCreditActive")}
          </p>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: "var(--foreground)" }}
          >
            {t("referralBoxText")}
          </p>
          <p
            className="mt-2 text-xs leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            {t("referralCodeLabel")} <span className="font-mono font-semibold">{referralSourceCode}</span>
          </p>
        </div>
      ) : null}

      {/* CTA */}
      <div className="mt-8 flex flex-col items-stretch gap-3 sm:items-center">
        <LocalizedLink
          href="/registry"
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-bold !text-white transition-colors duration-300 ease-out hover:bg-[var(--brand-dark)] sm:w-auto"
          style={{ color: "#ffffff" }}
        >
          {t("viewRegistry")}
        </LocalizedLink>
        <LocalizedLink
          href={purchaseHref}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--border)] bg-white px-5 py-3 text-center text-sm font-medium transition-colors duration-300 ease-out hover:bg-[var(--surface-soft)] hover:no-underline sm:w-auto"
          style={{ color: "var(--brand)" }}
        >
          {referralSourceCode
            ? t("joinThroughReferral")
            : t("joinAlliance")}
        </LocalizedLink>
      </div>
    </section>
  );
}
