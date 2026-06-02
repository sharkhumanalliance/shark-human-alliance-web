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
import { trackEvent, type AnalyticsParams } from "@/components/analytics";
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
  type TierKey,
} from "@/lib/tiers";
import { formatRegistryIdForDisplay } from "@/lib/registry-id";
import {
  ANALYTICS_ATTRIBUTION_SOURCE_KEY,
  buildCertificateAnalyticsItem,
  normalizeAnalyticsAttributionSource,
} from "@/lib/analytics-events";

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
  const templatesT = useTranslations("certificateTemplates");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";
  const isGiftSession = searchParams.get("gift") === "1";

  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [giftLinkCopied, setGiftLinkCopied] = useState(false);
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
  const previewSectionRef = useRef<HTMLElement>(null);
  const previewSummaryRef = useRef<HTMLDivElement>(null);
  const customizeSectionRef = useRef<HTMLElement>(null);

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
            // purchases by their originating surface (e.g. wanted_gift_cta).
            let attributionSource = "";
            if (typeof window !== "undefined") {
              try {
                attributionSource = normalizeAnalyticsAttributionSource(
                  window.sessionStorage.getItem(
                    ANALYTICS_ATTRIBUTION_SOURCE_KEY,
                  ) || "",
                );
              } catch {
                // sessionStorage unavailable — proceed without source.
              }
            }
            const item = buildCertificateAnalyticsItem(data.tier);
            const isPromo = sessionId.startsWith("promo_");
            const params: AnalyticsParams = {
              transaction_id: sessionId,
              value: isPromo ? 0 : item.price,
              currency: "USD",
              item_id: publicTier,
              item_name: item.item_name,
              tier: publicTier,
              locale,
              is_gift: isGiftSession,
              is_promo: isPromo,
              items: [item],
            };
            if (attributionSource) params.source = attributionSource;
            trackEvent("purchase", params);
            // Clear after firing so refreshing /success does not
            // re-attribute future unrelated sessions.
            if (attributionSource && typeof window !== "undefined") {
              try {
                window.sessionStorage.removeItem(
                  ANALYTICS_ATTRIBUTION_SOURCE_KEY,
                );
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
  }, [sessionId, locale, isGiftSession]);

  useEffect(() => pollForMember(), [pollForMember]);

  useEffect(() => {
    if (previewExpanded && previewSectionRef.current) {
      previewSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [previewExpanded]);

  useEffect(() => {
    if (customizeOpen && customizeSectionRef.current) {
      customizeSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [customizeOpen]);

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
    const downloadUrl = `/${locale}/certificate/view?token=${member.accessToken}&template=${template}&paper=${paperFormat}&download=1`;
    // Use a real anchor click so mobile browsers treat it as a direct user
    // navigation instead of a programmatic popup. window.open is silently
    // blocked on iOS Safari in some configurations.
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.target = "_blank";
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  function handleCustomizeToggle() {
    setCustomizeOpen((current) => !current);
  }

  function handleHideCustomize() {
    setCustomizeOpen(false);
    window.setTimeout(() => {
      previewSummaryRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
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
  // Gift purchases get a shareable reveal link so the buyer can preview what
  // the recipient sees and hand it over personally.
  const isGift = isGiftSession;
  const giftLink =
    isGift && member.accessToken
      ? `${typeof window !== "undefined" ? window.location.origin : ""}${buildLocalizedPath(locale, `/gift?to=${encodeURIComponent(member.name)}&token=${member.accessToken}`)}`
      : "";

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
            Hero — status badge, personalized title, single
            dominant CTA. Email notice is inline as a small
            caption right below the CTA so the user sees it in
            the same visual context.
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
              onClick={handleCustomizeToggle}
              aria-expanded={customizeOpen}
              aria-controls="certificate-customize"
              className="text-sm font-semibold text-[var(--brand-dark)] underline underline-offset-4 transition hover:text-[var(--brand)]"
            >
              {customizeOpen ? t("customizeHide") : t("previewCustomizeLink")}
            </button>
          </div>

          {downloadStatus ? (
            <div
              className="mx-auto mt-4 max-w-md rounded-xl border border-red-300 bg-red-50 px-5 py-4 text-center text-sm font-semibold text-red-800"
              role="alert"
              aria-live="assertive"
            >
              {downloadStatus}
            </div>
          ) : null}

          <p className="mx-auto mt-3 max-w-md text-xs leading-5 text-sky-800">
            {member.hasEmail ? t("emailSentAutomatic") : t("downloadOnlyNotice")}
          </p>
        </header>

        {isGift && giftLink ? (
          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-[var(--accent)]/40 bg-[var(--surface-soft)]/50 p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
              {t("giftSendTitle")}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {t("giftSendText")}
            </p>
            <div className="mt-4 flex flex-col items-stretch gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:px-4">
              <label htmlFor="gift-link" className="sr-only">
                {t("giftLinkLabel")}
              </label>
              <input
                id="gift-link"
                type="text"
                value={giftLink}
                readOnly
                aria-label={t("giftLinkLabel")}
                className="min-w-0 flex-grow bg-transparent text-sm font-mono leading-6 text-[var(--brand-dark)] focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(giftLink);
                  setGiftLinkCopied(true);
                  trackEvent("gift_link_copy", { tier: publicTier });
                  setTimeout(() => setGiftLinkCopied(false), 2000);
                }}
                className="shrink-0 rounded-md bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)]"
              >
                {giftLinkCopied ? "✓" : t("giftLinkCopy")}
              </button>
            </div>
            <a
              href={giftLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("gift_reveal_preview_click", { tier: publicTier })
              }
              className="mt-3 inline-flex min-h-[40px] items-center justify-center text-sm font-semibold text-[var(--accent)] transition hover:text-[var(--accent-dark)]"
            >
              {t("giftPreview")}
            </a>
          </div>
        ) : null}

        {/* ====================================================
            Side-by-side: small cert thumbnail (left) + impact
            strip (right) on desktop. Stacked on mobile.
            Tracking ID is inlined into the impact text as a
            quiet footer — no separate badge column.
           ==================================================== */}
        <div ref={previewSummaryRef} className={previewExpanded ? "mt-8 scroll-mt-24" : "mt-8 grid scroll-mt-24 gap-4 md:grid-cols-[220px_1fr] md:items-stretch"}>
          {!previewExpanded && (
          <button
            type="button"
            onClick={() => setPreviewExpanded(true)}
            aria-expanded={previewExpanded}
            aria-label={t("previewExpand")}
            className="group mx-auto flex h-full w-full max-w-sm cursor-zoom-in flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white p-2 transition hover:shadow-md focus-visible:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 active:bg-[var(--surface-soft)] md:max-w-none md:mx-0"
          >
            <div className="pointer-events-none mx-auto w-full max-w-[200px]">
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
            <p className="text-xs text-[var(--muted)]">
              {primaryPaperLabel} · {templatesT(`${template}.title`)}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] transition group-hover:text-[var(--brand-dark)]">
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              {t("previewExpandHint")}
            </span>
          </button>
          )}

          <section
            aria-label={t("impactEyebrow")}
            className="rounded-2xl border border-[var(--tier-nonsnack-border)] bg-[var(--tier-nonsnack-light)] px-5 py-5 sm:px-6"
          >
            <div className="flex h-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex flex-1 items-start gap-3 sm:items-center">
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
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--tier-nonsnack-text)]">
                    {t("impactEyebrow")}
                  </p>
                  <p className="mt-1 text-[15px] leading-6 text-[var(--brand-dark)] sm:text-base sm:leading-7">
                    {t.rich("impactText", {
                      donation: `$${tierDonationDollars}`,
                      strong: (chunks) => (
                        <strong className="font-semibold text-[var(--brand-dark)]">
                          {chunks}
                        </strong>
                      ),
                    })}
                  </p>
                  <p className="mt-2 text-[11px] leading-5 text-[var(--muted)]">
                    {t("impactTrackingLabel")} <span className="font-mono">{publicRegistryId}</span>
                  </p>
                </div>
              </div>
              <LocalizedLink
                href="/impact"
                className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-[var(--tier-nonsnack-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--tier-nonsnack-darker)] transition hover:bg-[var(--tier-nonsnack-surface)] sm:self-center"
              >
                {t("impactLink")}
                <span aria-hidden="true">{"→"}</span>
              </LocalizedLink>
            </div>
          </section>
        </div>

        {/* Customize panel — toggled via Hero link or thumbnail.
            No nested borders or surface shading: just spacing. */}
        {customizeOpen ? (
          <section
            id="certificate-customize"
            ref={customizeSectionRef}
            className="mt-6 scroll-mt-24 rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {t("customizeHelp")}
              </p>
              <button
                type="button"
                onClick={handleHideCustomize}
                className="text-xs font-semibold text-[var(--muted)] underline-offset-4 transition hover:text-[var(--brand-dark)] hover:underline"
              >
                {t("customizeHide")}
              </button>
            </div>
            <div className="sticky top-3 z-10 mx-auto mt-4 max-w-[170px] rounded-xl border border-[var(--border)] bg-white/95 p-2 shadow-sm backdrop-blur lg:hidden">
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
              <p className="mt-1 text-center text-[10px] font-medium text-[var(--muted)]">
                {primaryPaperLabel} · {templatesT(`${template}.title`)}
              </p>
            </div>
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
          </section>
        ) : null}

        {/* Expanded full-size preview — when thumbnail clicked */}
        {previewExpanded ? (
          <section ref={previewSectionRef} className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewExpanded(false)}
                className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)] underline-offset-4 transition hover:text-[var(--brand-dark)] hover:underline"
              >
                {t("previewCollapse")}
              </button>
            </div>
            <div className="mt-4">
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
          </section>
        ) : null}

        {/* Compact share row. */}
        <PostPurchaseShare
          variant="compact"
          member={{
            id: publicRegistryId,
            name: member.name,
            tier: publicTier,
          }}
        />

        {/* Manage record — inline horizontal row of links. */}
        <nav
          className="mt-2 border-b border-[var(--border)] py-4"
          aria-label={t("manageRecordTitle")}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm">
            {member.registryVisibility === "public" ? (
              <>
                <LocalizedLink
                  href={`/registry?highlight=${encodeURIComponent(publicRegistryId)}`}
                  className="font-semibold text-[var(--brand-dark)] underline-offset-4 hover:underline"
                >
                  {t("viewRegistry")}
                </LocalizedLink>
                <span aria-hidden="true" className="text-[var(--muted)]">
                  ·
                </span>
              </>
            ) : null}
            {member.accessToken ? (
              <>
                <LocalizedLink
                  href={`/certificate/view?token=${member.accessToken}#record-controls`}
                  className="font-semibold text-[var(--brand-dark)] underline-offset-4 hover:underline"
                >
                  {t("manageRecord")}
                </LocalizedLink>
                <span aria-hidden="true" className="text-[var(--muted)]">
                  ·
                </span>
              </>
            ) : null}
            <LocalizedLink
              href="/wanted"
              className="font-semibold text-[var(--brand-dark)] underline-offset-4 hover:underline"
            >
              {t("referralWantedPoster")}
            </LocalizedLink>
          </div>
          {member.registryVisibility !== "public" ? (
            <p className="mt-2 text-center text-xs leading-5 text-[var(--muted)]">
              {t("registryPrivateNotice")}
            </p>
          ) : null}
        </nav>

        {/* Referral — compact one-liner status + progress + link. */}
        {member.referralCode && (
          <section className="mt-8 pb-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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

            <p className="mt-5 text-sm leading-6 text-[var(--brand-dark)]">
              <strong className="font-semibold">
                {t("referralProtectedFriendStatus")}
              </strong>
              <span aria-hidden="true" className="mx-2 text-[var(--muted)]">
                →
              </span>
              <span className="text-[var(--muted)]">
                {t("referralProbationaryLiaison")}
                {member.referralCount > 0
                  ? ""
                  : ` — ${t("referralFirstRecruitNeeded").replace(/\.$/, "")}`}
              </span>
            </p>

            <div className="mt-3">
              <p className="text-[11px] font-semibold tabular-nums text-[var(--muted)]">
                {t("referralStepProgress", {
                  count: referralStepsCompleted,
                  target: referralStepTarget,
                })}
              </p>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--border)]/60">
                <div
                  className="h-full rounded-full bg-[var(--tier-nonsnack)] transition-[width]"
                  style={{ width: `${referralProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col items-stretch gap-3 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:px-4">
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

            <div className="mt-3">
              <LocalizedLink
                href="/career"
                className="text-xs font-semibold text-[var(--muted)] underline-offset-4 transition hover:text-[var(--brand-dark)] hover:underline"
              >
                {t("referralCareerLink")} →
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
