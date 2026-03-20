"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { generateCertificatePDF } from "@/lib/generate-certificate";
import { CertificatePreview } from "@/components/certificate/certificate-preview";

interface MemberData {
  id: string;
  name: string;
  tier: "basic" | "protected" | "nonsnack" | "business";
  date: string;
  dedication: string;
  referralCode: string;
  referralCount: number;
}

function SuccessContentInner() {
  const t = useTranslations("purchase");
  const ct = useTranslations("certificate");
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";

  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [pageFormat, setPageFormat] = useState<"a4" | "letter">("a4");

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

  function getCertTranslations(tier: string) {
    function readReasons(prefix: string, max: number) {
      const arr: string[] = [];
      for (let i = 0; i < max; i++) {
        try { arr.push(ct(`${prefix}.${i}`)); } catch { break; }
      }
      return arr;
    }

    if (tier === "business") {
      return {
        header: ct("businessHeader"),
        subtitle: ct("businessSubtitle"),
        certTitle: ct("businessCertTitle"),
        certifies: ct("certifies"),
        statusLabel: ct("statusLabel"),
        tierName: ct("tierNames.business"),
        body: ct("businessBody"),
        reasonsLabel: ct("businessReasonsLabel"),
        reasons: readReasons("businessReasons", 10),
        privileges: ct("businessPrivileges"),
        validityNote: ct("businessValidityNote"),
        sig1Name: ct("sig1Name"),
        sig1Title: ct("sig1Title"),
        sig2Name: ct("sig2Name"),
        sig2Title: ct("sig2Title"),
        sealText: ct("sealText"),
        dedicationLabel: ct("dedication"),
        dateLabel: ct("dateLabel"),
        registryIdLabel: ct("registryId"),
        disclaimer: ct("businessDisclaimer"),
      };
    }

    if (tier === "nonsnack") {
      return {
        header: ct("header"),
        subtitle: ct("nonsnackSubtitle"),
        certTitle: ct("nonsnackCertTitle"),
        certifies: ct("certifies"),
        statusLabel: ct("statusLabel"),
        tierName: ct("tierNames.nonsnack"),
        body: ct("nonsnackBody"),
        reasonsLabel: ct("nonsnackReasonsLabel"),
        reasons: readReasons("nonsnackReasons", 10),
        privileges: ct("nonsnackPrivileges"),
        validityNote: ct("validityNote"),
        sig1Name: ct("sig1Name"),
        sig1Title: ct("sig1Title"),
        sig2Name: ct("sig2Name"),
        sig2Title: ct("sig2Title"),
        sealText: ct("sealText"),
        dedicationLabel: ct("dedication"),
        dateLabel: ct("dateLabel"),
        registryIdLabel: ct("registryId"),
        disclaimer: ct("nonsnackDisclaimer"),
      };
    }

    return {
      header: ct("header"),
      subtitle: ct("subtitle"),
      certTitle: ct("certTitle"),
      certifies: ct("certifies"),
      statusLabel: ct("statusLabel"),
      tierName: ct("tierNames.protected"),
      body: ct("body"),
      reasonsLabel: ct("reasonsLabel"),
      reasons: readReasons("reasons", 10),
      privileges: ct("privileges"),
      validityNote: ct("validityNote"),
      sig1Name: ct("sig1Name"),
      sig1Title: ct("sig1Title"),
      sig2Name: ct("sig2Name"),
      sig2Title: ct("sig2Title"),
      sealText: ct("sealText"),
      dedicationLabel: ct("dedication"),
      dateLabel: ct("dateLabel"),
      registryIdLabel: ct("registryId"),
      disclaimer: ct("disclaimer"),
    };
  }

  /** Pick one reason — same hash logic as CertificatePreview so preview and PDF match. */
  function pickReason(name: string, reasons: string[]): string | undefined {
    if (!reasons || reasons.length === 0) return undefined;
    let hash = 0;
    const seed = name || "default";
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    }
    return reasons[Math.abs(hash) % reasons.length];
  }

  async function handleDownloadCertificate(format: "a4" | "letter" = pageFormat) {
    if (!member) return;
    const certT = getCertTranslations(member.tier);
    const doc = await generateCertificatePDF({
      name: member.name,
      tier: member.tier,
      date: new Date(member.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      dedication: member.dedication,
      registryId: member.id.toUpperCase(),
      format,
      selectedReason: pickReason(member.name, certT.reasons),
      t: certT,
    });
    doc.save(`SHA-Certificate-${member.name.replace(/\s+/g, "-")}.pdf`);
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
          <a
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
          >
            {t("backHome")}
          </a>
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

        {/* Certificate visual preview */}
        <div className="mt-10">
          <CertificatePreview
            name={member.name}
            tier={member.tier}
            dedication={member.dedication}
            date={displayDate}
            registryId={member.id.toUpperCase()}
            t={getCertTranslations(member.tier)}
          />
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center gap-4">
          {/* Format selector */}
          <div className="flex items-center gap-2 rounded-full border border-sky-200 bg-white p-1">
            <button
              onClick={() => setPageFormat("a4")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                pageFormat === "a4"
                  ? "bg-[var(--brand)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--brand-dark)]"
              }`}
            >
              A4
            </button>
            <button
              onClick={() => setPageFormat("letter")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                pageFormat === "letter"
                  ? "bg-[var(--brand)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--brand-dark)]"
              }`}
            >
              US Letter
            </button>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => handleDownloadCertificate()}
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-4 text-base font-semibold text-white transition hover:bg-[var(--brand-dark)]"
            >
              {t("downloadCert")} ({pageFormat === "a4" ? "A4" : "US Letter"})
            </button>

            <a
              href={`/registry?highlight=${member.id}`}
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:border-sky-300 hover:bg-sky-50"
            >
              {t("viewRegistry")}
            </a>
          </div>
        </div>

        {/* Referral section */}
        {member.referralCode && (
          <div className="mt-10 mx-auto max-w-xl">
            <div className="rounded-[2rem] border-2 border-dashed border-sky-200 bg-sky-50/50 p-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                {t("referralTitle")}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {t("referralText")}
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-3 mx-auto max-w-sm">
                <input
                  type="text"
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/purchase?tier=protected&ref=${member.referralCode}`}
                  readOnly
                  className="flex-grow bg-transparent text-sm font-mono text-[var(--brand-dark)] focus:outline-none truncate"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/purchase?tier=protected&ref=${member.referralCode}`
                    );
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  }}
                  className="shrink-0 rounded-full bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--brand-dark)]"
                >
                  {linkCopied ? "✓" : t("referralCopy")}
                </button>
              </div>
              <a
                href="/career"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
              >
                {t("referralCareerLink")} →
              </a>
            </div>
          </div>
        )}

        {/* Email notice */}
        <div className="mt-8 mx-auto max-w-md text-center">
          <p className="text-sm text-[var(--muted)]">
            {t("emailSentAutomatic")}
          </p>
        </div>

        <div className="mt-4 text-center">
          <a
            href="/"
            className="text-sm text-[var(--muted)] transition hover:text-[var(--brand-dark)]"
          >
            {t("backHome")}
          </a>
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
