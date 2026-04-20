"use client";

import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { CertificatePreview } from "@/components/certificate/certificate-preview";
import type { CertificateTemplate } from "@/components/certificate/certificate-document";
import type { PaperFormat } from "@/components/certificate/certificate-sheet";
import { CertificateTemplateSelector } from "@/components/certificate/certificate-template-selector";
import { trackEvent } from "@/components/analytics";
import { LocalizedLink } from "@/components/ui/localized-link";
import { PostPurchaseShare } from "@/components/purchase/post-purchase-share";
import { buildReferralHref, buildLocalizedPath } from "@/lib/navigation";
import { StepIndicator } from "@/components/purchase/step-indicator";
import { formatCertificateDate } from "@/lib/dates";

interface MemberData {
  id: string;
  name: string;
  tier: "basic" | "protected" | "nonsnack" | "business";
  date: string;
  dedication: string;
  referralCode: string;
  referralCount: number;
  accessToken?: string;
  hasEmail?: boolean;
  registryVisibility: "public" | "private";
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
  const initialPaper =
    (searchParams.get("paper") as PaperFormat) === "letter"
      ? "letter"
      : "a4";
  const [template, setTemplate] = useState<CertificateTemplate>("luxury");
  const [paperFormat, setPaperFormat] = useState<PaperFormat>(initialPaper);
  const purchaseTrackedRef = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 8;

    async function fetchMember() {
      try {
        const res = await fetch(`/api/member-by-session?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setMember(data);
          setLoading(false);

          if (!purchaseTrackedRef.current) {
            purchaseTrackedRef.current = true;
            const tierValues: Record<string, number> = {
              basic: 5,
              protected: 5,
              nonsnack: 19,
              business: 99,
            };
            trackEvent("purchase", {
              transaction_id: sessionId,
              value: tierValues[data.tier] ?? 5,
              currency: "USD",
              item_id: data.tier,
              item_name: data.tier,
            });
          }
          return true;
        }
      } catch {
        // Retry
      }
      return false;
    }

    async function poll() {
      const found = await fetchMember();
      if (!found && attempts < maxAttempts) {
        attempts++;
        const delay = attempts <= 3 ? 500 : 2000;
        setTimeout(poll, delay);
      } else if (!found) {
        setLoading(false);
        setTimedOut(true);
      }
    }

    poll();
  }, [sessionId]);

  function handleRetryPolling() {
    setTimedOut(false);
    setLoading(true);
    setMember(null);

    let attempts = 0;
    const maxAttempts = 8;

    async function fetchMember() {
      try {
        const res = await fetch(`/api/member-by-session?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setMember(data);
          setLoading(false);
          return true;
        }
      } catch {
        // Retry
      }
      return false;
    }

    async function poll() {
      const found = await fetchMember();
      if (!found && attempts < maxAttempts) {
        attempts++;
        const delay = attempts <= 3 ? 500 : 2000;
        setTimeout(poll, delay);
      } else if (!found) {
        setLoading(false);
        setTimedOut(true);
      }
    }

    poll();
  }

  function handleDownloadCertificate() {
    if (!member) return;
    trackEvent("certificate_download", {
      tier: member.tier,
      format: paperFormat,
    });
    if (!member.accessToken) {
      setDownloadStatus(t("downloadNotReady"));
      return;
    }
    setDownloadStatus("");
    window.open(
      `/${locale}/certificate/view?token=${member.accessToken}&template=${template}&paper=${paperFormat}`,
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
          member={{ id: member.id, name: member.name, tier: member.tier }}
        />

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
            tier={member.tier}
            dedication={member.dedication}
            date={displayDate}
            registryId={member.id.toUpperCase()}
            referralCode={member.referralCode}
            template={template}
            paperFormat={paperFormat}
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

        {member.referralCode && (
          <div className="mt-8 mx-auto max-w-xl">
            <div className="rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-4 text-center sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                {t("referralTitle")}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {t("referralText")}
              </p>
              <div className="mx-auto mt-4 flex max-w-sm flex-col items-stretch gap-2 rounded-xl border border-[var(--border)] bg-white p-3 sm:flex-row sm:items-center sm:px-4 sm:py-3">
                <label htmlFor="referral-link" className="sr-only">
                  {t("referralTitle")}
                </label>
                <input
                  id="referral-link"
                  type="text"
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}${buildLocalizedPath(locale, buildReferralHref(member.referralCode))}`}
                  readOnly
                  aria-label={t("referralTitle")}
                  className="min-w-0 flex-grow bg-transparent text-sm font-mono leading-6 text-[var(--brand-dark)] focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}${buildLocalizedPath(locale, buildReferralHref(member.referralCode))}`
                    );
                    setLinkCopied(true);
                    setDownloadStatus("");
                    trackEvent("referral_link_copy", { tier: member.tier });
                    setTimeout(() => setLinkCopied(false), 2000);
                  }}
                  className="shrink-0 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-xs font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--brand-dark)] sm:px-4"
                >
                  {linkCopied ? "\u2713" : t("referralCopy")}
                </button>
              </div>
              <LocalizedLink
                href="/career"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
              >
                {t("referralCareerLink")} {"\u2192"}
              </LocalizedLink>
            </div>
          </div>
        )}

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
