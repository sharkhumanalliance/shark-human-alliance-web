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
import { formatCertificateDate } from "@/lib/dates";
import {
  isPaperFormatAvailableForTemplate,
  normalizePaperFormatForTemplate,
} from "@/lib/certificate-paper";
import {
  getPublicTierKey,
  getTierMetadata,
  getTierPriceDollars,
  type TierKey,
} from "@/lib/tiers";
import { formatRegistryIdForDisplay } from "@/lib/registry-id";

interface MemberData {
  id: string;
  registryCode?: string;
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

async function fetchMemberBySession(sessionId: string): Promise<MemberData | null> {
  const res = await fetch(`/api/member-by-session?session_id=${sessionId}`);
  if (!res.ok) return null;
  return res.json();
}

function SuccessContentInner() {
  const t = useTranslations("purchase");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";

  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const initialPaper = normalizePaperFormatForTemplate(
    "luxury",
    searchParams.get("paper"),
  );
  const [template, setTemplate] = useState<CertificateTemplate>("luxury");
  const [paperFormat, setPaperFormat] = useState<PaperFormat>(initialPaper);
  const purchaseTrackedRef = useRef(false);

  const handleTemplateChange = useCallback((nextTemplate: CertificateTemplate) => {
    setTemplate(nextTemplate);
    setPaperFormat((current) =>
      normalizePaperFormatForTemplate(nextTemplate, current),
    );
  }, []);

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
            // Recover cross-funnel attribution stored on /purchase before
            // the Stripe redirect. This is the bridge that lets GA4 group
            // purchases by their originating surface (e.g. wanted_poster).
            let attributionSource = "";
            if (typeof window !== "undefined") {
              try {
                attributionSource =
                  window.sessionStorage.getItem("sha_attribution_source") || "";
              } catch {
                // sessionStorage unavailable — proceed without source.
              }
            }
            const params: Record<string, string | number | boolean> = {
              transaction_id: sessionId,
              value: getTierPriceDollars(data.tier),
              currency: "USD",
              item_id: publicTier,
              item_name: publicTier,
            };
            if (attributionSource) params.source = attributionSource;
            trackEvent("purchase", params);
            // Clear after firing so refreshing /success does not
            // re-attribute future unrelated sessions.
            if (attributionSource && typeof window !== "undefined") {
              try {
                window.sessionStorage.removeItem("sha_attribution_source");
              } catch {
                // ignore
              }
            }
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
      handleTemplateChange(normalizeTemplate(member.template));
    }
  }, [handleTemplateChange, member?.template]);

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
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
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
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
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
  const referralStepsCompleted = member.referralCount > 0 ? 2 : 1;
  const referralStepTarget = 2;
  const referralProgressPercent =
    (referralStepsCompleted / referralStepTarget) * 100;
  const referralHref = member.referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}${buildLocalizedPath(locale, buildReferralHref(member.referralCode))}`
    : "";
  const publicTier = getPublicTierKey(member.tier);
  const publicRegistryId = member.registryCode || formatRegistryIdForDisplay(member.id);

  // Impact strip value — donationCents comes from the canonical tier
  // metadata so this cannot drift away from the /impact page. We intentionally
  // do NOT surface the ratio of donation/price on the success page; the goal
  // here is a positive confirmation of impact, not a transparency breakdown
  // (that lives on /impact).
  const tierDonationDollars =
    getTierMetadata(member.tier).donationCents / 100;

  // The Hero's primary CTA reflects the currently selected paper format.
  const primaryPaperLabel =
    paperFormat === "letter"
      ? t("paperSizes.letter.label")
      : t("paperSizes.a4.label");

  return (
    <section data-reveal className="py-12 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* ====================================================
            Section 1 - Hero
            Personalized confirmation + the single dominant CTA.
            Email / "download-only" notices live here too so the
            user sees them in the same visual context as the
            Download button.
           ==================================================== */}
        <header className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--tier-nonsnack-light)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--tier-nonsnack-text)]">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[var(--tier-nonsnack)]"
              aria-hidden="true"
            />
            {t("successStatusBadge")}
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
            {t("successTitleNamed", { name: member.name })}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            {t("successTextBrief")}
          </p>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleDownloadCertificate}
              className="inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white shadow-md transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:w-auto"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {t("downloadCertHero", { paper: primaryPaperLabel })}
            </button>
            <button
              type="button"
              onClick={() => setCustomizeOpen((value) => !value)}
              aria-expanded={customizeOpen}
              aria-controls="certificate-customize"
              className="text-sm font-semibold text-[var(--brand-dark)] underline decoration-dashed underline-offset-4 transition hover:text-[var(--brand)]"
            >
              {customizeOpen ? t("customizeHide") : t("previewCustomizeLink")}
            </button>
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

          <div className="mx-auto mt-3 max-w-md text-center">
            {member.hasEmail ? (
              <p className="text-xs text-[var(--muted)]">
                {t("emailSentAutomatic")}
              </p>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-2 text-[11px] font-medium text-amber-800">
                {t("downloadOnlyNotice")}
              </div>
            )}
          </div>
        </header>

        {/* ====================================================
            Section 2 - Impact strip
            The emotional core that was missing on the original
            success page: confirmation that the user just funded
            shark conservation, with the actual allocation amount
            and tracking ID, linking out to /impact for full
            transparency.
           ==================================================== */}
        <section
          aria-label={t("impactEyebrow")}
          className="mt-8 rounded-2xl border border-[var(--tier-nonsnack-border)] bg-[var(--tier-nonsnack-light)] px-5 py-4 sm:px-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="flex flex-1 items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--tier-nonsnack-surface)] text-[var(--tier-nonsnack-text)]"
                aria-hidden="true"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 12c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8c2.21 0 4.21.895 5.657 2.343" />
                  <polyline points="20 4 20 9 15 9" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--tier-nonsnack-text)]">
                  {t("impactEyebrow")}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--brand-dark)] sm:text-[15px]">
                  {t.rich("impactText", {
                    donation: `$${tierDonationDollars}`,
                    strong: (chunks) => (
                      <strong className="font-semibold text-[var(--brand-dark)]">
                        {chunks}
                      </strong>
                    ),
                  })}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--tier-nonsnack-border)] bg-white/70 px-2.5 py-1 font-mono text-[11px] text-[var(--brand-dark)]">
                <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                  {t("impactTrackingLabel")}
                </span>
                {publicRegistryId}
              </span>
              <LocalizedLink
                href="/impact"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--tier-nonsnack-darker)] transition hover:text-[var(--tier-nonsnack-text)]"
              >
                {t("impactLink")} {"\u2192"}
              </LocalizedLink>
            </div>
          </div>
        </section>

        {/* ====================================================
            Certificate card - preview + customize.
            Default state is COLLAPSED so the page stays compact
            after checkout. The Hero's "Preview & customize before
            downloading" link is the primary way to open it; this
            section only renders when customizeOpen is true.
           ==================================================== */}
        <section className="mt-8 rounded-[32px] border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">
                {t("statusIssued")}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-2xl">
                {t("yourCertificateTitle")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                {t("yourCertificateLead")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCustomizeOpen((value) => !value)}
              aria-expanded={customizeOpen}
              aria-controls="certificate-customize"
              className="self-start inline-flex min-h-[40px] items-center justify-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-dark)] transition-colors hover:bg-sky-50 sm:self-end"
            >
              {customizeOpen ? t("customizeHide") : t("customizeShow")}
            </button>
          </div>

          {customizeOpen ? (
          <div
            id="certificate-customize"
            className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]/55 p-4 sm:p-5"
          >
              <p className="text-xs leading-5 text-[var(--muted)]">
                {t("customizeHelp")}
              </p>
              <div className="mt-4">
                <CertificateTemplateSelector
                  value={template}
                  onChange={handleTemplateChange}
                />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                {(["a4", "letter"] as PaperFormat[]).map((formatOption) => {
                  const isSelected = paperFormat === formatOption;
                  const isUnavailable = !isPaperFormatAvailableForTemplate(
                    template,
                    formatOption,
                  );
                  return (
                    <button
                      key={formatOption}
                      type="button"
                      disabled={isUnavailable}
                      aria-disabled={isUnavailable}
                      title={
                        isUnavailable
                          ? t("paperSizes.letter.classicUnavailable")
                          : undefined
                      }
                      onClick={() => {
                        if (!isUnavailable) setPaperFormat(formatOption);
                      }}
                      className={`min-h-[46px] rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                        isUnavailable
                          ? "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-500 opacity-80 grayscale"
                          : isSelected
                          ? "border-sky-400 bg-sky-50 text-[var(--brand-dark)] shadow-sm"
                          : "border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--surface-soft)]"
                      }`}
                    >
                      <span className="block">
                        {formatOption === "letter"
                          ? t("paperSizes.letter.label")
                          : t("paperSizes.a4.label")}
                      </span>
                      {isUnavailable ? (
                        <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.14em]">
                          {t("paperSizes.letter.classicUnavailable")}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            <p className="mt-3 text-center text-xs text-[var(--muted)]">
              {t("paperSizeHint")}
            </p>
          </div>
          ) : null}

          <div
            className={
              previewExpanded
                ? "mt-6"
                : "mx-auto mt-6 w-full max-w-[260px] cursor-zoom-in transition hover:opacity-90 sm:max-w-[300px]"
            }
            onClick={() => {
              if (!previewExpanded) setPreviewExpanded(true);
            }}
            role={previewExpanded ? undefined : "button"}
            tabIndex={previewExpanded ? undefined : 0}
            aria-label={previewExpanded ? undefined : t("previewExpand")}
            onKeyDown={(event) => {
              if (previewExpanded) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setPreviewExpanded(true);
              }
            }}
          >
            <CertificatePreview
              name={member.name}
              tier={publicTier}
              dedication={member.dedication}
              date={displayDate}
              registryId={publicRegistryId}
              referralCode={member.referralCode}
              template={template}
              paperFormat={paperFormat}
              locale={locale}
            />
          </div>
          {previewExpanded ? (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setPreviewExpanded(false)}
                className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-dark)] transition-colors hover:bg-sky-50"
              >
                {t("previewCollapse")}
              </button>
            </div>
          ) : (
            <p className="mt-3 text-center text-xs text-[var(--muted)]">
              {t("previewExpandHint")}
            </p>
          )}
        </section>

        {/* ====================================================
            Section 3 - Share row (compact)
            The big Story mock-up was moved out of the success
            page (it competed visually with the actual product
            the user just bought). Only the share / download /
            copy actions remain, on one quiet row.
           ==================================================== */}
        <PostPurchaseShare
          variant="compact"
          member={{ id: publicRegistryId, name: member.name, tier: publicTier }}
        />

        {/* ====================================================
            Section 4 - Manage your record (secondary actions)
            Visually muted card with text-link affordances. The
            original page rendered these as full-size colored
            CTAs which competed with the primary Download
            button; here they are tertiary by design.
           ==================================================== */}
        <section className="mt-8" aria-label={t("manageRecordTitle")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {t("manageRecordTitle")}
          </p>
          <ul className="mt-3 grid gap-0 border-y border-[var(--border)] sm:grid-cols-3 sm:divide-x sm:divide-[var(--border)]">
            {member.registryVisibility === "public" ? (
              <li>
                <LocalizedLink
                  href={`/registry?highlight=${encodeURIComponent(publicRegistryId)}`}
                  className="group flex h-full flex-col gap-1 border-b border-[var(--border)] px-0 py-4 transition hover:bg-[var(--surface-soft)]/60 sm:border-b-0 sm:px-5"
                >
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-dark)]">
                    {t("viewRegistry")}
                    <span
                      aria-hidden="true"
                      className="text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--brand-dark)]"
                    >
                      {"\u2192"}
                    </span>
                  </span>
                  <span className="text-xs leading-5 text-[var(--muted)]">
                    {t("secondaryRegistryDesc")}
                  </span>
                </LocalizedLink>
              </li>
            ) : null}
            {member.accessToken ? (
              <li>
                <LocalizedLink
                  href={`/certificate/view?token=${member.accessToken}#record-controls`}
                  className="group flex h-full flex-col gap-1 border-b border-[var(--border)] px-0 py-4 transition hover:bg-[var(--surface-soft)]/60 sm:border-b-0 sm:px-5"
                >
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-dark)]">
                    {t("manageRecord")}
                    <span
                      aria-hidden="true"
                      className="text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--brand-dark)]"
                    >
                      {"→"}
                    </span>
                  </span>
                  <span className="text-xs leading-5 text-[var(--muted)]">
                    {t("secondaryManageDesc")}
                  </span>
                </LocalizedLink>
              </li>
            ) : null}
            <li>
              <LocalizedLink
                href="/wanted"
                className="group flex h-full flex-col gap-1 px-0 py-4 transition hover:bg-[var(--surface-soft)]/60 sm:px-5"
              >
                <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-dark)]">
                  {t("referralWantedPoster")}
                  <span
                    aria-hidden="true"
                    className="text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--brand-dark)]"
                  >
                    {"→"}
                  </span>
                </span>
                <span className="text-xs leading-5 text-[var(--muted)]">
                  {t("secondaryWantedDesc")}
                </span>
              </LocalizedLink>
            </li>
          </ul>
          {member.registryVisibility !== "public" ? (
            <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
              {t("registryPrivateNotice")}
            </p>
          ) : null}
        </section>

        {/* Long-term value pass — referral. Visually muted so it doesn't compete
            with primary actions above. */}
        {member.referralCode && (
          <section className="mt-8 border-y border-[var(--border)] py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {t("referralTitle")}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-2xl">
                  {t("referralMomentTitle")}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  {t("referralText")}
                </p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {t("referralCodeLabel")}
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-[var(--brand-dark)]">
                  {member.referralCode}
                </p>
              </div>
            </div>

            <div className="mt-5 grid border-y border-[var(--border)] sm:grid-cols-2 sm:divide-x sm:divide-[var(--border)]">
              <div className="py-4 sm:pr-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {t("referralCurrentStatus")}
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--brand-dark)]">
                  {t("referralRegisteredDiplomatStatus")}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {t("referralPaperworkComplete")}
                </p>
              </div>
              <div className="border-t border-[var(--border)] py-4 sm:border-t-0 sm:pl-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {t("referralNextStep")}
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--brand-dark)]">
                  {t("referralProbationaryLiaison")}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {member.referralCount > 0
                    ? t("referralFirstRecruitComplete")
                    : t("referralFirstRecruitNeeded")}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {t("referralProgressLabel")}
                </p>
                <p className="text-xs font-semibold tabular-nums text-[var(--brand-dark)]">
                  {t("referralStepProgress", {
                    count: referralStepsCompleted,
                    target: referralStepTarget,
                  })}
                </p>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-[var(--border)]/60">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-[width]"
                  style={{ width: `${referralProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col items-stretch gap-3 border border-[var(--border)] bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:px-4">
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
                className="shrink-0 rounded-md bg-[var(--brand)] px-4 py-2.5 text-xs font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--brand-dark)] sm:px-4"
              >
                {linkCopied ? "✓" : t("referralCopy")}
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <LocalizedLink
                href="/career"
                className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--brand-dark)] transition-colors hover:bg-[var(--surface-soft)]"
              >
                {t("referralCareerLink")}
              </LocalizedLink>
            </div>
          </section>
        )}

        <div className="mt-8 text-center">
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
