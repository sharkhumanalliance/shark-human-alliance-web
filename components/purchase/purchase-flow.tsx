"use client";

import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useMemo, Suspense, useId } from "react";
import { CertificatePreview } from "@/components/certificate/certificate-preview";
import type { CertificateTemplate } from "@/components/certificate/certificate-document";
import type { PaperFormat } from "@/components/certificate/certificate-sheet";
import { CertificateTemplateSelector } from "@/components/certificate/certificate-template-selector";
import { StepIndicator } from "@/components/purchase/step-indicator";
import { trackEvent } from "@/components/analytics";
import { formatCertificateDate } from "@/lib/dates";

type Tier = "basic" | "protected" | "nonsnack" | "business";



function SecureCardIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 9h19" />
      <path d="M6.5 15h4" />
    </svg>
  );
}

function StripeWordmarkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="4" width="19" height="16" rx="4" fill="currentColor" opacity="0.12" />
      <path d="M8.1 9.35c0-.74.61-1.16 1.62-1.16 1.44 0 3.25.44 4.69 1.22V6.17A9.23 9.23 0 0 0 9.72 5C6.7 5 4.7 6.58 4.7 9.23c0 4.13 5.67 3.47 5.67 5.3 0 .88-.77 1.16-1.85 1.16-1.56 0-3.56-.64-5.13-1.5v3.29c1.74.75 3.5 1.06 5.13 1.06 3.1 0 5.23-1.53 5.23-4.2 0-4.47-5.65-3.68-5.65-4.99Z" fill="currentColor" />
      <path d="M14.98 6.3h3.7v11.22h-3.7z" fill="currentColor" opacity="0.82" />
    </svg>
  );
}

function PurchaseFlowInner() {
  const t = useTranslations("purchase");
  const searchParams = useSearchParams();
  const locale = useLocale();

  const initialTier = (searchParams.get("tier") as Tier) || "protected";
  const initialName = searchParams.get("name") || "";
  const initialGift = searchParams.get("gift") === "true";
  const initialPaper = (searchParams.get("paper") as PaperFormat) === "letter" ? "letter" : "a4";
  const initialTemplateParam = searchParams.get("template");
  const normalizedInitialTemplate: CertificateTemplate =
    initialTemplateParam === "formal" || initialTemplateParam === "hero" || initialTemplateParam === "luxury"
      ? initialTemplateParam
      : "luxury";
  const referredByFromUrl = searchParams.get("ref") || "";
  const wasCanceled = searchParams.get("canceled") === "true";

  const [referredByCode, setReferredByCode] = useState(referredByFromUrl);
  const [tier, setTier] = useState<Tier>(initialTier);
  const [name, setName] = useState(initialName);
  const [dedication, setDedication] = useState("");

  // Pick 3 random dedication suggestions from the pool (stable per mount)
  const dedicationSuggestions = useMemo(() => {
    const pool = Array.from({ length: 15 }, (_, index) =>
      t(`dedicationSuggestions.${index}`)
    );
    const picked: string[] = [];
    for (let i = 0; i < 3 && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return picked;
  }, [t]);
  const [email, setEmail] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [isGift, setIsGift] = useState(initialGift);
  const [promoCode, setPromoCode] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState("");
  const [showEmailWarning, setShowEmailWarning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [template, setTemplate] = useState<CertificateTemplate>(normalizedInitialTemplate);
  const [paperFormat, setPaperFormat] = useState<PaperFormat>(initialPaper);
  const giftToggleLabelId = useId();


  useEffect(() => {
    if (typeof window === "undefined") return;

    if (referredByFromUrl) {
      window.localStorage.setItem("sha_referral_code", referredByFromUrl);
      setReferredByCode(referredByFromUrl);
      return;
    }

    const storedReferralCode = window.localStorage.getItem("sha_referral_code") || "";
    if (storedReferralCode) {
      setReferredByCode(storedReferralCode);
    }
  }, [referredByFromUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const normalized = referredByCode.trim().toUpperCase();
    if (normalized) {
      window.localStorage.setItem("sha_referral_code", normalized);
    } else {
      window.localStorage.removeItem("sha_referral_code");
    }
  }, [referredByCode]);

  const tierPrices: Record<Tier, string> = {
    basic: "$4",
    protected: "$4",
    nonsnack: "$19",
    business: "$99",
  };

  const tierValues: Record<Tier, number> = {
    basic: 4,
    protected: 4,
    nonsnack: 19,
    business: 99,
  };

  // Track view_item on initial load
  const viewedRef = useRef(false);
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    trackEvent("view_item", {
      item_id: initialTier,
      item_name: initialTier,
      value: tierValues[initialTier],
      currency: "USD",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track select_item when tier changes (skip initial render)
  const isFirstTierRender = useRef(true);
  useEffect(() => {
    if (isFirstTierRender.current) { isFirstTierRender.current = false; return; }
    trackEvent("select_item", {
      item_id: tier,
      item_name: tier,
      value: tierValues[tier],
      currency: "USD",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    // If no email and warning not yet confirmed, show warning instead of submitting
    if (!email.trim() && !showEmailWarning) {
      setShowEmailWarning(true);
      trackEvent("no_email_warning_shown", { tier });
      return;
    }

    // If email warning shown but confirmation not yet shown, show confirmation
    if (showEmailWarning && !showConfirmation) {
      setShowConfirmation(true);
      trackEvent("confirmation_shown", { tier });
      return;
    }

    // If no email warning needed but confirmation not yet shown, show confirmation
    if (!showConfirmation) {
      setShowConfirmation(true);
      trackEvent("confirmation_shown", { tier });
      return;
    }

    // At this point, confirmation has been shown
    if (!email.trim() && showEmailWarning) {
      trackEvent("no_email_confirmed", { tier });
    }

    trackEvent("begin_checkout", {
      item_id: tier,
      item_name: tier,
      value: tierValues[tier],
      currency: "USD",
      is_gift: isGift,
      has_promo: promoCode.trim().length > 0,
      has_email: email.trim().length > 0,
    });

    setShowEmailWarning(false);
    setShowConfirmation(false);
    setIsRedirecting(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          name: name.trim(),
          dedication: dedication.trim(),
          email: email.trim(),
          isGift,
          recipientEmail: recipientEmail.trim(),
          referredBy: referredByCode.trim().toUpperCase() || undefined,
          locale,
          promoCode: promoCode.trim() || undefined,
          template,
          paperFormat,
          giftMessage: giftMessage.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Checkout failed");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("[SHA] Checkout error:", err);
      setError(t("checkoutError"));
      setIsRedirecting(false);
    }
  }

  const currentDate = formatCertificateDate(new Date(), locale);

  if (isRedirecting) {
    return (
      <section data-reveal className="py-24 sm:py-32">
        <div className="mx-auto max-w-lg px-4 sm:px-6 text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-sky-200 border-t-[var(--brand)]" />
          <p className="mt-8 text-lg font-semibold text-[var(--brand-dark)]">
            {t("redirecting")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section data-reveal className="py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-3xl lg:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-base leading-7 text-[var(--muted)] sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Step indicator */}
        <div className="mt-8">
          <StepIndicator currentStep={1} />
        </div>

        {/* Canceled notice */}
        {wasCanceled && (
          <div
            className="mt-6 mx-auto max-w-md rounded-xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-center text-sm text-amber-800"
            role="status"
            aria-live="polite"
          >
            {t("canceledNotice")}
          </div>
        )}

        {/* Referral badge */}
        {referredByCode && (
          <div className="mt-6 mx-auto max-w-md rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-5 py-3 text-center text-sm text-[var(--brand-dark)]">
            {t("referredByBadge")}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="mt-6 mx-auto max-w-md rounded-xl border border-red-200 bg-red-50/50 px-5 py-4 text-center text-sm text-red-700"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <div className="mt-10 grid gap-8 md:gap-10 lg:mt-12 lg:grid-cols-[1fr_1.1fr]">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <details className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-semibold text-[var(--brand-dark)] sm:px-5">
                <span>{t("livePreview")}</span>
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  PDF
                </span>
              </summary>
              <div className="border-t border-[var(--border)] bg-[var(--surface-soft)]/50 px-3 py-4 sm:px-4">
                <CertificateTemplateSelector value={template} onChange={setTemplate} />
                <div className="mt-4">
                  <CertificatePreview
                    name={name.trim() || t("previewName")}
                    tier={tier}
                    dedication={dedication.trim()}
                    date={currentDate}
                    registryId="SHA-XXXX"
                    template={template}
                    paperFormat={paperFormat}
                  />
                </div>
              </div>
            </details>
            {/* Tier selector */}
            <div>
              <label className="text-sm font-semibold text-[var(--brand-dark)]">
                {t("tierLabel")}
              </label>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(["protected", "nonsnack", "business"] as Tier[]).map((tierOption) => {
                  const isSelected = tier === tierOption;
                  const colors: Record<Tier, string> = {
                    basic: isSelected ? "border-sky-400 bg-sky-50" : "border-sky-100 bg-white",
                    protected: isSelected ? "border-[var(--tier-protected)] bg-[var(--tier-protected-light)]" : "border-[var(--tier-protected-border-light)] bg-white",
                    nonsnack: isSelected ? "border-[var(--tier-nonsnack)] bg-[var(--tier-nonsnack-light)]" : "border-[var(--tier-nonsnack-border-light)] bg-white",
                    business: isSelected ? "border-[var(--tier-business)] bg-[var(--tier-business-light)]/80" : "border-[var(--tier-business-border-light)] bg-white",
                  };
                  return (
                    <button
                      key={tierOption}
                      type="button"
                      onClick={() => setTier(tierOption)}
                      className={`min-h-[108px] rounded-2xl border ${colors[tierOption]} px-4 py-4 text-center transition-colors duration-300 ease-out`}
                    >
                      <p className="text-lg font-semibold text-[var(--brand-dark)]">
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

            {/* Paper size */}
            <div>
              <label className="text-sm font-semibold text-[var(--brand-dark)]">
                {t("paperSizeLabel")}
              </label>
              <div className="mt-2 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
                {(["a4", "letter"] as PaperFormat[]).map((formatOption) => {
                  const isSelected = paperFormat === formatOption;
                  return (
                    <button
                      key={formatOption}
                      type="button"
                      onClick={() => setPaperFormat(formatOption)}
                      className={`rounded-xl border px-4 py-3 text-left transition ${
                        isSelected
                          ? "border-sky-400 bg-sky-50 shadow-sm"
                          : "border-[var(--border)] bg-white hover:bg-sky-50/50"
                      }`}
                    >
                      <div className="text-sm font-semibold text-[var(--brand-dark)]">
                        {t(`paperSizes.${formatOption}.label`)}
                      </div>
                      <div className="mt-1 text-xs text-[var(--muted)]">
                        {t(`paperSizes.${formatOption}.description`)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gift toggle */}
            <div className="flex min-h-[56px] items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-4">
              <button
                type="button"
                onClick={() => { const next = !isGift; setIsGift(next); trackEvent("gift_toggle", { tier, enabled: next }); }}
                role="switch"
                aria-checked={isGift}
                aria-labelledby={giftToggleLabelId}
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
              <span id={giftToggleLabelId} className="flex-1 text-sm font-medium text-[var(--brand-dark)]">
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
                name="name"
                type="text"
                autoComplete={tier === "business" ? "organization" : "name"}
                inputMode="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tier === "business" ? t("businessNamePlaceholder") : t("namePlaceholder")}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-5 py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
            </div>

            {/* Dedication */}
            <div>
              <label htmlFor="dedication" className="text-sm font-semibold text-[var(--brand-dark)]">
                {tier === "business" ? t("businessDedicationLabel") : t("dedicationLabel")}
              </label>
              <input
                id="dedication"
                name="dedication"
                type="text"
                autoComplete="off"
                inputMode="text"
                value={dedication}
                onChange={(e) => setDedication(e.target.value)}
                placeholder={tier === "business" ? t("businessDedicationPlaceholder") : t("dedicationPlaceholder")}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-5 py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
              {tier !== "business" && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {dedicationSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setDedication(suggestion)}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-left text-xs text-[var(--muted)] transition-colors duration-300 ease-out hover:bg-sky-50 sm:w-auto sm:py-1"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="flex flex-col gap-1 min-[420px]:flex-row min-[420px]:items-baseline min-[420px]:justify-between">
                <label htmlFor="email" className="text-sm font-semibold text-[var(--brand-dark)]">
                  {t("emailLabel")}
                </label>
                <span className="text-xs text-[var(--muted)]">{t("emailOptionalTag")}</span>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setShowEmailWarning(false); }}
                placeholder={t("emailPlaceholder")}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-5 py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
              <p className="mt-1.5 text-xs text-[var(--muted)]">{t("emailOptionalHint")}</p>
            </div>

            {/* Referral code */}
            <div>
              <div className="flex flex-col gap-1 min-[420px]:flex-row min-[420px]:items-baseline min-[420px]:justify-between">
                <label htmlFor="referredByCode" className="text-sm font-semibold text-[var(--brand-dark)]">
                  {t("referredByLabel")}
                </label>
                <span className="text-xs text-[var(--muted)]">{t("referredByOptionalTag")}</span>
              </div>
              <input
                id="referredByCode"
                name="referred_by_code"
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={referredByCode}
                onChange={(e) => setReferredByCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                placeholder={t("referredByPlaceholder")}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-5 py-4 text-sm font-mono uppercase text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
              <p className="mt-1.5 text-xs text-[var(--muted)]">{t("referredByHint")}</p>
            </div>

            {/* Gift fields */}
            {isGift && (
              <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-dark)]">{t("giftDetailsTitle")}</p>
                <div>
                  <label htmlFor="recipientEmail" className="text-sm font-semibold text-[var(--brand-dark)]">
                    {t("recipientEmailLabel")}
                  </label>
                  <input
                    id="recipientEmail"
                    name="recipient_email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder={t("recipientEmailPlaceholder")}
                    className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-5 py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                  />
                  <p className="mt-1.5 text-xs text-[var(--muted)]">{t("recipientEmailHint")}</p>
                </div>
                <div>
                  <label htmlFor="giftMessage" className="text-sm font-semibold text-[var(--brand-dark)]">
                    {t("giftMessageLabel")}
                  </label>
                  <textarea
                    id="giftMessage"
                    name="gift_message"
                    autoComplete="off"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder={t("giftMessagePlaceholder")}
                    rows={3}
                    className="mt-2 w-full resize-none rounded-xl border border-[var(--border)] bg-white px-5 py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                  />
                </div>
              </div>
            )}

            {/* Promo code */}
            <div>
              <label htmlFor="promoCode" className="text-sm font-semibold text-[var(--brand-dark)]">
                {t("promoCodeLabel")}
              </label>
              <input
                id="promoCode"
                name="promo_code_nofill"
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder={t("promoCodePlaceholder")}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-form-type="other"
                data-lpignore="true"
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-5 py-4 text-sm font-mono text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 uppercase"
              />
            </div>

            {/* Stripe secure payment note */}
            <div className="rounded-2xl border border-teal-100 bg-teal-50/35 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-white text-teal-700 shadow-sm">
                  <SecureCardIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--brand-dark)]">
                    {t("stripeSecure")}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
                    {t("stripeSecureNote")}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-[var(--brand-dark)] shadow-sm">
                  <SecureCardIcon className="h-3.5 w-3.5 text-teal-700" />
                  {t("secureBadgeCard")}
                </span>
                <span className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-[var(--brand-dark)] shadow-sm">
                  <StripeWordmarkIcon className="h-3.5 w-3.5 text-indigo-600" />
                  {t("secureBadgeStripe")}
                </span>
              </div>
            </div>

            {/* No-email warning */}
            {showEmailWarning && (
              <div
                className="rounded-xl border border-amber-200 bg-amber-50 p-4"
                role="status"
                aria-live="polite"
              >
                <p className="text-sm font-semibold text-amber-800">{t("noEmailWarningTitle")}</p>
                <p className="mt-1 text-sm leading-6 text-amber-700">{t("noEmailWarningText")}</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="submit"
                    className="min-h-[44px] flex-1 rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-amber-800"
                  >
                    {t("noEmailContinue")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailWarning(false);
                      document.getElementById("email")?.focus();
                    }}
                    className="min-h-[44px] flex-1 rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-800 transition-colors duration-300 ease-out hover:bg-amber-50"
                  >
                    {t("noEmailAddEmail")}
                  </button>
                </div>
              </div>
            )}

            {/* Confirmation card */}
            {showConfirmation && (
              <div
                className="rounded-2xl border border-[var(--border)] bg-sky-50 p-5 sm:p-6"
                role="status"
                aria-live="polite"
              >
                <h3 className="text-base font-semibold text-[var(--brand-dark)]">
                  {t("confirmTitle")}
                </h3>
                <div className="mt-4 space-y-3">
                  {/* Name */}
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      {isGift ? t("confirmGiftFor") : t("confirmName")}
                    </span>
                    <span className="text-sm font-medium text-[var(--brand-dark)]">
                      {name.trim()}
                    </span>
                  </div>
                  {/* Tier */}
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      {t("confirmTier")}
                    </span>
                    <span className="text-sm font-medium text-[var(--brand-dark)]">
                      {t(`tiers.${tier}`)}
                    </span>
                  </div>
                  {/* Template */}
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      {t("confirmTemplate")}
                    </span>
                    <span className="text-sm font-medium text-[var(--brand-dark)] capitalize">
                      {template}
                    </span>
                  </div>
                  {/* Dedication (if provided) */}
                  {dedication.trim() && (
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        {t("confirmDedication")}
                      </span>
                      <span className="text-sm font-medium text-[var(--brand-dark)] text-right max-w-[200px] line-clamp-2">
                        {dedication.trim()}
                      </span>
                    </div>
                  )}
                </div>
                {/* Action buttons */}
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="flex-1 min-h-[44px] rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)]"
                  >
                    {t("confirmButton")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 min-h-[44px] rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-sky-50"
                  >
                    {t("confirmBack")}
                  </button>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isRedirecting}
              className="min-h-[52px] w-full rounded-xl bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {promoCode.trim()
                ? t("submitButtonPromo")
                : `${t("submitButton")} - ${tierPrices[tier]}`}
            </button>
          </form>

          {/* Live certificate preview */}
          <div className="hidden lg:block lg:self-start">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("livePreview")}
            </p>
            <CertificateTemplateSelector value={template} onChange={setTemplate} />
            <div className="sticky top-28 mt-4">
              <CertificatePreview
                name={name.trim() || t("previewName")}
                tier={tier}
                dedication={dedication.trim()}
                date={currentDate}
                registryId="SHA-XXXX"
                template={template}
                paperFormat={paperFormat}
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
        <section data-reveal className="py-24 sm:py-32">
          <div className="mx-auto max-w-lg px-4 sm:px-6 text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-sky-200 border-t-[var(--brand)]" />
          </div>
        </section>
      }
    >
      <PurchaseFlowInner />
    </Suspense>
  );
}

