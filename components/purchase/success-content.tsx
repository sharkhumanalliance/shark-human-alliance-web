"use client";

import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { CertificatePreview } from "@/components/certificate/certificate-preview";
import {
  type CertificateTemplate,
  isAcceptedCertificateTemplate,
  normalizeTemplate,
} from "@/components/certificate/certificate-document";
import type { PaperFormat } from "@/components/certificate/certificate-sheet";
import { CertificateTemplateSelector } from "@/components/certificate/certificate-template-selector";
import { trackEvent } from "@/components/analytics";
import { LocalizedLink } from "@/components/ui/localized-link";
import { PostPurchaseShare } from "@/components/purchase/post-purchase-share";
import { buildReferralHref, buildLocalizedPath } from "@/lib/navigation";
import { StepIndicator } from "@/components/purchase/step-indicator";
import { formatCertificateDate } from "@/lib/dates";
import { getNextRank, getRankInfo } from "@/lib/referral-ranks";
import {
  getPublicTierKey,
  getTierPriceDollars,
  type TierKey,
} from "@/lib/tiers";

interface MemberData {
  id: string;
  name: string;
  tier: TierKey;
  date: string;
  dedication: string;
  template?: string;
  referralCode: string;
  referralCount: number;
  accessToken?: string;
  hasEmail?: boolean;
  registryVisibility: "public" | "private";
}

const RANK_TRANSLATION_KEYS: Record<string, string> = {
  civilian: "civilian",
  intern: "probationaryLiaison",
  fieldAgent: "fieldOperative",
  seniorDiplomat: "seniorDiplomat",
  ambassador: "specialEnvoy",
  chiefWhisperer: "chiefSharkWhisperer",
};

async function fetchMemberBySession(sessionId: string): Promise<MemberData | null> {
  const res = await fetch(`/api/member-by-session?session_id=${sessionId}`);
  if (!res.ok) return null;
  return res.json();
}

function SuccessContentInner() {
  const t = useTranslations("purchase");
  const rankT = useTranslations("career.ranks");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";

  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState("");
  const initialPaper =
    (searchParams.get("paper") as PaperFormat) === "letter"
      ? "letter"
      : "a4";
  const [template, setTemplate] = useState<CertificateTemplate>("luxury");
  const [paperFormat, setPaperFormat] = useState<PaperFormat>(initialPaper);
  const purchaseTrackedRef = useRef(false);

  const pollForMember = useCallback(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    setTimedOut(false);
    setLoading(true);
    setMember(null);

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 8;

    async function poll() {
      try {
        const data = await fetchMemberBySession(sessionId);
        if (data) {
          if (cancelled) return;
          setMember(data);
          setLoading(false);

          if (!purchaseTrackedRef.current) {
            purchaseTrackedRef.current = true;
            const publicTier = getPublicTierKey(data.tier);
            trackEvent("purchase", {
              transaction_id: sessionId,
              value: getTierPriceDollars(data.tier),
              currency: "USD",
              item_id: publicTier,
              item_name: publicTier,
            });
          }
          return;
        }
      } catch {
        // Retry
      }

      if (cancelled) return;

      if (attempts < maxAttempts) {
        attempts++;
        const delay = attempts <= 3 ? 500 : 2000;
        setTimeout(poll, delay);
      } else {
        setLoading(false);
        setTimedOut(true);
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => pollForMember(), [pollForMember]);

  useEffect(() => {
    if (isAcceptedCertificateTemplate(member?.template)) {
      setTemplate(normalizeTemplate(member.template));
    }
  }, [member?.template]);

  function handleRetryPolling() {
    pollForMember();
  }

  function handleDownloadCertificate() {
    if (!member) return;
    const publicTier = getPublicTierKey(member.tier);
    trackEvent("certificate_download", {
      tier: publicTier,
      format: paperFormat,
    });
    if (!member.accessToken) {
      setDownloadStatus(t("downloadNotReady"));
      return;
    }
    setDownloadStatus("");
    window.open(
      `/${locale}/certificate/view?token=${member.accessToken}&template=${template}&paper=${paperFormat}&download=1`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  if (loading) {
    return (
      <section data-reveal className="py-24 sm:py-32">
        <div className="mx-auto max-w-lg px-4 sm:px-6">
          <div className="mb-10">
            <StepIndicator currentStep={3} />
          </div>
          <div className="text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-sky-200 border-t-[var(--brand)]" />
            <p className="mt-8 text-lg font-semibold text-[var(--brand-dark)]">
              {t("processing")}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {t("successLoading")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!member && timedOut) {
    return (
      <section data-reveal className="py-10 sm:py-14">
        <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              {t("statusDone")}
            </div>
          <h1 className="mt-6 text-xl font-semibold text-[var(--brand-dark)] sm:text-2xl">
            {t("timeoutTitle")}
          </h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {t("timeoutText")}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <button
              onClick={handleRetryPolling}
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--brand-dark)]"
            >
              {t("timeoutRetry")}
            </button>
            <LocalizedLink
              href="/"
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-sky-50"
            >
              {t("backHome")}
            </LocalizedLink>
          </div>
        </div>
      </section>
    );
  }

  if (!member) {
    return (
      <section data-reveal className="py-10 sm:py-14">
        <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              {t("statusDone")}
            </div>
          <h1 className="mt-6 text-xl font-semibold text-[var(--brand-dark)] sm:text-2xl">
            {t("timeoutTitle")}
          </h1>
          <p className="mt-3 text-sm text-[var(--muted)]">{t("timeoutText")}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <LocalizedLink
              href="/purchase"
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--brand-dark)]"
            >
              {t("purchaseCta")}
            </LocalizedLink>
            <LocalizedLink
              href="/"
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-sky-50"
            >
              {t("backHome")}
            </LocalizedLink>
          </div>
        </div>
      </section>
    );
  }

  const displayDate = formatCertificateDate(member.date, locale);
  const currentRank = getRankInfo(member.referralCount);
  const nextRank = getNextRank(member.referralCount);
  const currentRankName = rankT(`${RANK_TRANSLATION_KEYS[currentRank.id]}.name`);
  const nextRankName = nextRank
    ? rankT(`${RANK_TRANSLATION_KEYS[nextRank.rank.id]}.name`)
    : null;
  const referralProgressPercent = nextRank
    ? Math.min(
        100,
        Math.max(
          0,
          ((member.referralCount - currentRank.minReferrals) /
            (nextRank.rank.minReferrals - currentRank.minReferrals)) *
            100
        )
      )
    : 100;
  const referralHref = member.referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}${buildLocalizedPath(locale, buildReferralHref(member.referralCode))}`
    : "";
  const publicTier = getPublicTierKey(member.tier);

  return (
    <section data-reveal className="py-12 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-8">
          <StepIndicator currentStep={3} />
        </div>

        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            {t("statusIssued")}
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-[var(--brand-dark)] sm:text-3xl">
            {t("successTitle")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            {t("successText")}
          </p>
        </div>

        <PostPurchaseShare
          member={{ id: member.id, name: member.name, tier: publicTier }}
        />

        {member.referralCode && (
          <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-sky-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                  {t("referralTitle")}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--brand-dark)]">
                  {t("referralMomentTitle")}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  {t("referralText")}
                </p>
              </div>
              <div className="shrink-0 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-left sm:text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-800/75">
                  {t("referralCodeLabel")}
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-[var(--brand-dark)]">
                  {member.referralCode}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/55 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {t("referralCurrentRank")}
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--brand-dark)]">
                  {currentRankName}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {t("referralProgressValue", {
                    count: member.referralCount,
                    target: nextRank?.rank.minReferrals ?? member.referralCount,
                  })}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/55 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {t("referralNextRank")}
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--brand-dark)]">
                  {nextRankName ?? t("referralMaxRankTitle")}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {nextRank
                    ? t("referralRemaining", {
                        count: nextRank.remaining,
                        rank: nextRankName ?? "",
                      })
                    : t("referralMaxRankText")}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {t("referralProgressLabel")}
                </p>
                <p className="text-xs font-semibold tabular-nums text-[var(--brand-dark)]">
                  {Math.round(referralProgressPercent)}%
                </p>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-sky-100">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-[width]"
                  style={{ width: `${referralProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col items-stretch gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/45 p-3 sm:flex-row sm:items-center sm:px-4 sm:py-3">
              <label htmlFor="referral-link" className="sr-only">
                {t("referralLinkLabel")}
              </label>
              <input
                id="referral-link"
                type="text"
                value={referralHref}
                readOnly
                aria-label={t("referralLinkLabel")}
                className="min-w-0 flex-grow bg-transparent text-sm font-mono leading-6 text-[var(--brand-dark)] focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}${buildLocalizedPath(locale, buildReferralHref(member.referralCode))}`
                  );
                  setLinkCopied(true);
                  setDownloadStatus("");
                  trackEvent("referral_link_copy", { tier: publicTier });
                  setTimeout(() => setLinkCopied(false), 2000);
                }}
                className="shrink-0 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-xs font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--brand-dark)] sm:px-4"
              >
                {linkCopied ? "\u2713" : t("referralCopy")}
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <LocalizedLink
                href="/career"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--brand-dark)] transition-colors hover:bg-sky-50"
              >
                {t("referralCareerLink")}
              </LocalizedLink>
              <LocalizedLink
                href={`/wanted?name=${encodeURIComponent(member.name)}`}
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-dark)]"
              >
                {t("referralWantedPoster")}
              </LocalizedLink>
            </div>
          </section>
        )}

        <div className="mt-6 sm:mt-8">
          <CertificateTemplateSelector
            value={template}
            onChange={setTemplate}
          />
        </div>

        <div className="mt-5 mx-auto grid max-w-xl grid-cols-1 gap-3 min-[420px]:grid-cols-2">
          {(["a4", "letter"] as PaperFormat[]).map((formatOption) => {
            const isSelected = paperFormat === formatOption;
            return (
              <button
                key={formatOption}
                type="button"
                onClick={() => setPaperFormat(formatOption)}
                className={`min-h-[46px] rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isSelected
                    ? "border-sky-400 bg-sky-50 text-[var(--brand-dark)] shadow-sm"
                    : "border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--surface-soft)]"
                }`}
              >
                {formatOption === "letter"
                  ? t("paperSizes.letter.label")
                  : t("paperSizes.a4.label")}
              </button>
            );
          })}
          <p className="min-[420px]:col-span-2 text-center text-xs text-[var(--muted)]">
            {t("paperSizeHint")}
          </p>
        </div>

        <div className="mt-5">
          <CertificatePreview
            name={member.name}
            tier={publicTier}
            dedication={member.dedication}
            date={displayDate}
            registryId={member.id.toUpperCase()}
            referralCode={member.referralCode}
            template={template}
            paperFormat={paperFormat}
            locale={locale}
          />
        </div>

        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          <button
            onClick={handleDownloadCertificate}
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[var(--brand)] px-6 py-4 text-base font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--brand-dark)] sm:w-auto"
          >
            {t("downloadCert")} (
            {paperFormat === "letter"
              ? t("paperSizes.letter.label")
              : t("paperSizes.a4.label")}
            )
          </button>

          {member.registryVisibility === "public" ? (
            <LocalizedLink
              href={`/registry?highlight=${member.id}`}
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl border border-[var(--border)] bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-sky-50 sm:w-auto"
            >
              {t("viewRegistry")}
            </LocalizedLink>
          ) : null}
          {member.accessToken ? (
            <LocalizedLink
              href={`/certificate/view?token=${member.accessToken}#record-controls`}
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl border border-[var(--border)] bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-sky-50 sm:w-auto"
            >
              {t("manageRecord")}
            </LocalizedLink>
          ) : null}
        </div>

        {downloadStatus ? (
          <div
            className="mx-auto mt-4 max-w-md rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm font-medium text-amber-800"
            role="status"
            aria-live="polite"
          >
            {downloadStatus}
          </div>
        ) : null}

        <div className="mt-6 mx-auto max-w-md text-center">
          {member.hasEmail ? (
            <p className="text-sm text-[var(--muted)]">
              {t("emailSentAutomatic")}
            </p>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
              {t("downloadOnlyNotice")}
            </div>
          )}
          {member.registryVisibility !== "public" ? (
            <p className="mt-3 text-sm text-[var(--muted)]">
              {t("registryPrivateNotice")}
            </p>
          ) : null}
        </div>

        <div className="mt-6 text-center">
          <LocalizedLink
            href="/"
            className="text-sm text-[var(--muted)] transition hover:text-[var(--brand-dark)]"
          >
            {t("backHome")}
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}

export function SuccessContent() {
  return (
    <Suspense
      fallback={
        <section data-reveal className="py-24 sm:py-32">
          <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-sky-200 border-t-[var(--brand)]" />
          </div>
        </section>
      }
    >
      <SuccessContentInner />
    </Suspense>
  );
}
