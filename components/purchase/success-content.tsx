"use client";

import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { CertificatePreview } from "@/components/certificate/certificate-preview";
import type { CertificateTemplate } from "@/components/certificate/certificate-document";
import { CertificateTemplateSelector } from "@/components/certificate/certificate-template-selector";
import { trackEvent } from "@/components/analytics";
import { LocalizedLink } from "@/components/ui/localized-link";
import { buildReferralHref, buildLocalizedPath } from "@/lib/navigation";

interface MemberData {
  id: string;
  name: string;
  tier: "basic" | "protected" | "nonsnack" | "business";
  date: string;
  dedication: string;
  referralCode: string;
  referralCount: number;
  accessToken?: string;
  email?: string;
}

function SuccessContentInner() {
  const t = useTranslations("purchase");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";

  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [template, setTemplate] = useState<CertificateTemplate>("hero");
  const purchaseTrackedRef = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;
    const delay = 2000;

    // Webhook might not have fired yet — poll for the member
    async function fetchMember() {
      try {
        const res = await fetch(`/api/member-by-session?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setMember(data);
          setLoading(false);
          // Fire GA4 purchase event once
          if (!purchaseTrackedRef.current) {
            purchaseTrackedRef.current = true;
            const tierValues: Record<string, number> = { basic: 5, protected: 5, nonsnack: 19, business: 99 };
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
        setTimeout(poll, delay);
      } else if (!found) {
        setLoading(false);
      }
    }

    poll();
  }, [sessionId]);

  function handleDownloadCertificate() {
    if (!member) return;
    trackEvent("certificate_download", { tier: member.tier, format: "a4" });
    if (!member.accessToken) {
      // Token not available — certificate not ready or legacy member without token.
      // Do not fall back to ID-based URL to avoid exposing predictable routes.
      alert("Certificate is not ready yet. Please try again in a moment.");
      return;
    }
    window.open(
      `/${locale}/certificate/view?token=${member.accessToken}&template=${template}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  // Loading state
  if (loading) {
    return (
      <section className="py-32">
        <div className="mx-auto max-w-lg px-6 text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-sky-200 border-t-[var(--brand)]" />
          <p className="mt-8 text-lg font-semibold text-[var(--brand-dark)]">
            {t("processing")}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {t("successLoading")}
          </p>
        </div>
      </section>
    );
  }

  // Member not found (webhook hasn't fired or invalid session)
  if (!member) {
    return (
      <section className="py-14">
        <div className="mx-auto max-w-lg px-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-4xl">
            ⏳
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-[var(--brand-dark)]">
            {t("successPending")}
          </h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {t("successPendingText")}
          </p>
          <LocalizedLink
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
          >
            {t("backHome")}
          </LocalizedLink>
        </div>
      </section>
    );
  }

  // Success!
  const displayDate = new Date(member.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="py-14">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-4xl">
            🦈
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-[var(--brand-dark)]">
            {t("successTitle")}
          </h1>
          <p className="mt-3 text-lg text-[var(--muted)]">
            {t("successText")}
          </p>
        </div>

        {/* Template selector */}
        <div className="mt-10">
          <CertificateTemplateSelector value={template} onChange={setTemplate} />
        </div>

        {/* Certificate visual preview */}
        <div className="mt-6">
          <CertificatePreview
            name={member.name}
            tier={member.tier}
            dedication={member.dedication}
            date={displayDate}
            registryId={member.id.toUpperCase()}
            template={template}
          />
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleDownloadCertificate}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--brand)] px-6 py-4 text-base font-semibold text-white transition hover:bg-[var(--brand-dark)]"
          >
            {t("downloadCert")} (A4)
          </button>

          <LocalizedLink
            href={`/registry?highlight=${member.id}`}
            className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:border-sky-300 hover:bg-sky-50"
          >
            {t("viewRegistry")}
          </LocalizedLink>
        </div>

        {/* Referral section */}
        {member.referralCode && (
          <div className="mt-10 mx-auto max-w-xl">
            <div className="rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                {t("referralTitle")}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {t("referralText")}
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-3 mx-auto max-w-sm">
                <input
                  type="text"
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}${buildLocalizedPath(locale, buildReferralHref(member.referralCode))}`}
                  readOnly
                  className="flex-grow bg-transparent text-sm font-mono text-[var(--brand-dark)] focus:outline-none truncate"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}${buildLocalizedPath(locale, buildReferralHref(member.referralCode))}`
                    );
                    setLinkCopied(true);
                    trackEvent("referral_link_copy", { tier: member.tier });
                    setTimeout(() => setLinkCopied(false), 2000);
                  }}
                  className="shrink-0 rounded-lg bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--brand-dark)]"
                >
                  {linkCopied ? "✓" : t("referralCopy")}
                </button>
              </div>
              <LocalizedLink
                href="/career"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
              >
                {t("referralCareerLink")} →
              </LocalizedLink>
            </div>
          </div>
        )}

        {/* Email notice */}
        <div className="mt-8 mx-auto max-w-md text-center">
          {member.email ? (
            <p className="text-sm text-[var(--muted)]">
              {t("emailSentAutomatic")}
            </p>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
              {t("downloadOnlyNotice")}
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
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
        <section className="py-32">
          <div className="mx-auto max-w-lg px-6 text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-sky-200 border-t-[var(--brand)]" />
          </div>
        </section>
      }
    >
      <SuccessContentInner />
    </Suspense>
  );
}
