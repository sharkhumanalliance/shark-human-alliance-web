"use client";

import { useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";
import { getRankInfo } from "@/lib/referral-ranks";

type VerifyContentProps = {
  name: string;
  tier: string;
  date: string;
  registryId: string;
  referralCode: string;
  referralCount?: number;
  referralSourceCode?: string;
};

function getTierLabel(tier: string) {
  const normalized = tier?.toLowerCase() ?? "";
  if (normalized === "nonsnack" || normalized.includes("non-snack"))
    return "Non-Snack Recognition";
  if (normalized === "business" || normalized.includes("zone"))
    return "Shark-Approved Zone";
  return "Protected Friend";
}

function getTierColor(tier: string) {
  const normalized = tier?.toLowerCase() ?? "";
  if (normalized === "nonsnack" || normalized.includes("non-snack"))
    return "#b85c1a";
  if (normalized === "business" || normalized.includes("zone"))
    return "#5b3fa0";
  return "#1a7a6d";
}

const VERIFICATION_QUIPS = [
  "Our sharks have reviewed the records and confirm: this one checks out.",
  "Cross-referenced with marine intelligence. Status: legitimate and mildly reassuring.",
  "The Department of Aquatic Bureaucracy has stamped this record. Twice, for emphasis.",
  "Verified by Finnley Mako personally. He used his reading glasses and everything.",
  "This membership has survived our rigorous three-second verification process.",
  "Confirmed. The ocean's most meticulous filing system has spoken.",
];

function getQuip(registryId: string) {
  let hash = 0;
  for (let i = 0; i < registryId.length; i++) {
    hash = ((hash << 5) - hash + registryId.charCodeAt(i)) | 0;
  }
  return VERIFICATION_QUIPS[Math.abs(hash) % VERIFICATION_QUIPS.length];
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
  const t = useTranslations("verify");
  const tierLabel = getTierLabel(tier);
  const tierColor = getTierColor(tier);
  const quip = getQuip(registryId);
  const rank = getRankInfo(referralCount || 0);
  const purchaseHref = referralSourceCode
    ? `/purchase?tier=protected&ref=${encodeURIComponent(referralSourceCode)}`
    : "/purchase?tier=protected";

  return (
    <section className="mx-auto max-w-xl px-5 py-16 md:py-24">
      {/* Badge */}
      <div className="mb-6 flex items-center justify-center gap-2">
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

      {/* Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-lg">
        <h1
          className="mb-1 text-center text-2xl font-bold"
          style={{ color: "var(--brand-dark)" }}
        >
          {name}
        </h1>

        <p
          className="mb-6 text-center text-lg font-semibold"
          style={{ color: tierColor, fontVariant: "small-caps" }}
        >
          {tierLabel}
        </p>

        <div className="mb-6 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 text-center shadow-sm">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.24em]"
            style={{ color: "#9a6700" }}
          >
            {t("allianceRank")}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2 text-[var(--brand-dark)]">
            <span className="text-2xl" aria-hidden="true">{rank.icon}</span>
            <span className="text-lg font-semibold">{rank.label}</span>
          </div>
          <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
            {t("rankProgress", { count: referralCount || 0 })}
          </p>
        </div>

        <div className="mb-6 rounded-xl bg-[var(--surface-soft)] p-5">
          <p
            className="text-center text-sm leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            {quip}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm">
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
              className="font-mono font-semibold"
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
              className="font-mono font-semibold"
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
        <div className="mt-8 rounded-2xl border border-[color:rgba(16,185,129,0.24)] bg-[color:rgba(16,185,129,0.08)] p-5 text-center shadow-sm">
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
      <div className="mt-8 flex flex-col items-center gap-3">
        <LocalizedLink
          href="/registry"
          className="rounded-full px-6 py-2.5 text-sm font-bold text-white transition-colors"
          style={{ background: "var(--brand)" }}
        >
          {t("viewRegistry")}
        </LocalizedLink>
        <LocalizedLink
          href={purchaseHref}
          className="text-center text-sm font-medium transition-colors hover:underline"
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
