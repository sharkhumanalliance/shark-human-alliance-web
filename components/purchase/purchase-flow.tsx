"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { generateCertificatePDF } from "@/lib/generate-certificate";
import { CertificatePreview } from "@/components/certificate/certificate-preview";

type Tier = "basic" | "protected" | "nonsnack" | "business";

function PurchaseFlowInner() {
  const t = useTranslations("purchase");
  const ct = useTranslations("certificate");
  const searchParams = useSearchParams();

  const initialTier = (searchParams.get("tier") as Tier) || "protected";

  const [tier, setTier] = useState<Tier>(initialTier);
  const [name, setName] = useState("");
  const [dedication, setDedication] = useState("");
  const [email, setEmail] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [memberId, setMemberId] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const tierPrices: Record<Tier, string> = {
    basic: "$9",
    protected: "$19",
    nonsnack: "$29",
    business: "$99",
  };

  const tierIcons: Record<Tier, string> = {
    basic: "🐟",
    protected: "🛡️",
    nonsnack: "🚫🍽️",
    business: "🏢",
  };

  function getCertTranslations() {
    const tierKey = tier === "business" ? "business" : tier;
    return {
      header: ct("header"),
      subtitle: tier === "business" ? ct("businessSubtitle") : ct("subtitle"),
      certTitle: tier === "business" ? ct("businessCertTitle") : ct("certTitle"),
      certifies: ct("certifies"),
      statusLabel: ct("statusLabel"),
      tierName: ct(`tierNames.${tierKey}`),
      body: tier === "business" ? ct("businessBody") : ct("body"),
      dedicationLabel: ct("dedication"),
      dateLabel: ct("dateLabel"),
      registryIdLabel: ct("registryId"),
      seal: ct("seal"),
      footer: tier === "business" ? ct("businessFooter") : ct("footer"),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setStep("processing");

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), tier, dedication: dedication.trim() }),
      });

      if (!res.ok) throw new Error("Failed to register");

      const member = await res.json();
      setMemberId(member.id);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStep("success");
    } catch {
      setMemberId(`m-${Date.now()}`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStep("success");
    }
  }

  function handleDownloadCertificate() {
    const doc = generateCertificatePDF({
      name: name.trim(),
      tier: tier === "business" ? "nonsnack" : tier,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      dedication: dedication.trim(),
      registryId: memberId.toUpperCase(),
      t: getCertTranslations(),
    });

    doc.save(`SHA-Certificate-${name.trim().replace(/\s+/g, "-")}.pdf`);
  }

  async function handleSendEmail() {
    const targetEmail = isGift && recipientEmail ? recipientEmail : email;
    if (!targetEmail) return;

    setEmailSending(true);
    try {
      await fetch("/api/send-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: targetEmail,
          name: name.trim(),
          tier,
          dedication: dedication.trim(),
          memberId,
        }),
      });
    } catch {
      // Silently fail for prototype
    }
    setEmailSending(false);
    setEmailSent(true);
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (step === "processing") {
    return (
      <section className="py-32">
        <div className="mx-auto max-w-lg px-6 text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-sky-200 border-t-[var(--brand)]" />
          <p className="mt-8 text-lg font-semibold text-[var(--brand-dark)]">
            {t("processing")}
          </p>
        </div>
      </section>
    );
  }

  if (step === "success") {
    return (
      <section className="py-20">
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
              name={name.trim()}
              tier={tier}
              dedication={dedication.trim()}
              date={currentDate}
              registryId={memberId.toUpperCase()}
              t={getCertTranslations()}
            />
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleDownloadCertificate}
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-4 text-base font-semibold text-white transition hover:bg-[var(--brand-dark)]"
            >
              {t("downloadCert")}
            </button>

            {!emailSent ? (
              <button
                onClick={handleSendEmail}
                disabled={emailSending}
                className="inline-flex items-center justify-center rounded-full border border-teal-200 bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:bg-teal-50 disabled:opacity-50"
              >
                {emailSending ? t("sendingEmail") : t("sendEmail")}
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-6 py-4 text-base font-semibold text-teal-700">
                ✓ {t("emailSentConfirm")}
              </span>
            )}

            <a
              href="/registry"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:border-sky-300 hover:bg-sky-50"
            >
              {t("viewRegistry")}
            </a>
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

  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tier selector */}
            <div>
              <label className="text-sm font-semibold text-[var(--brand-dark)]">
                {t("tierLabel")}
              </label>
              <div className="mt-2 grid gap-3 grid-cols-2">
                {(["basic", "protected", "nonsnack", "business"] as Tier[]).map((tierOption) => {
                  const isSelected = tier === tierOption;
                  const colors: Record<Tier, string> = {
                    basic: isSelected ? "border-sky-400 bg-sky-50" : "border-sky-100",
                    protected: isSelected ? "border-teal-400 bg-teal-50" : "border-teal-100",
                    nonsnack: isSelected ? "border-orange-400 bg-orange-50" : "border-orange-100",
                    business: isSelected ? "border-indigo-400 bg-indigo-50" : "border-indigo-100",
                  };
                  return (
                    <button
                      key={tierOption}
                      type="button"
                      onClick={() => setTier(tierOption)}
                      className={`rounded-2xl border-2 ${colors[tierOption]} p-4 text-center transition hover:shadow-md`}
                    >
                      <p className="text-xl">{tierIcons[tierOption]}</p>
                      <p className="mt-1 text-lg font-semibold text-[var(--brand-dark)]">
                        {tierPrices[tierOption]}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {t(`tiers.${tierOption}`)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gift toggle */}
            <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
              <button
                type="button"
                onClick={() => setIsGift(!isGift)}
                className={`relative h-6 w-11 rounded-full transition ${
                  isGift ? "bg-[var(--brand)]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                    isGift ? "translate-x-5" : ""
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-[var(--brand-dark)]">
                {t("giftToggle")}
              </span>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="text-sm font-semibold text-[var(--brand-dark)]">
                {tier === "business" ? t("businessNameLabel") : t("nameLabel")}
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tier === "business" ? t("businessNamePlaceholder") : t("namePlaceholder")}
                className="mt-2 w-full rounded-2xl border border-sky-200 bg-white px-5 py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
            </div>

            {/* Dedication */}
            <div>
              <label htmlFor="dedication" className="text-sm font-semibold text-[var(--brand-dark)]">
                {tier === "business" ? t("businessDedicationLabel") : t("dedicationLabel")}
              </label>
              <input
                id="dedication"
                type="text"
                value={dedication}
                onChange={(e) => setDedication(e.target.value)}
                placeholder={tier === "business" ? t("businessDedicationPlaceholder") : t("dedicationPlaceholder")}
                className="mt-2 w-full rounded-2xl border border-sky-200 bg-white px-5 py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-[var(--brand-dark)]">
                {t("emailLabel")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="mt-2 w-full rounded-2xl border border-sky-200 bg-white px-5 py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
            </div>

            {/* Recipient email (gift mode) */}
            {isGift && (
              <div>
                <label htmlFor="recipientEmail" className="text-sm font-semibold text-[var(--brand-dark)]">
                  {t("recipientEmailLabel")}
                </label>
                <input
                  id="recipientEmail"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder={t("recipientEmailPlaceholder")}
                  className="mt-2 w-full rounded-2xl border border-sky-200 bg-white px-5 py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                />
              </div>
            )}

            {/* Payment placeholder */}
            <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-[var(--surface-soft)] p-6">
              <p className="text-sm font-semibold text-[var(--brand-dark)]">
                {t("paymentTitle")}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {t("paymentPlaceholder")}
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!name.trim() || !email.trim()}
              className="w-full rounded-full bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white transition hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("submitButton")}
            </button>
          </form>

          {/* Live certificate preview */}
          <div className="hidden lg:block">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("livePreview")}
            </p>
            <div className="sticky top-28">
              <CertificatePreview
                name={name.trim() || t("previewName")}
                tier={tier}
                dedication={dedication.trim()}
                date={currentDate}
                registryId="SHA-XXXX"
                t={getCertTranslations()}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PurchaseFlow() {
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
      <PurchaseFlowInner />
    </Suspense>
  );
}
