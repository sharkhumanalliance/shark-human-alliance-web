"use client";

import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { CertificatePreview } from "@/components/certificate/certificate-preview";
import type { CertificateTemplate } from "@/components/certificate/certificate-document";
import { CertificateTemplateSelector } from "@/components/certificate/certificate-template-selector";
import { trackEvent } from "@/components/analytics";

type Tier = "basic" | "protected" | "nonsnack" | "business";

const DEDICATION_SUGGESTIONS = [
  "For surviving every beach vacation since 1987",
  "Because you always said 'something touched my foot'",
  "Officially no longer snack material",
  "In honor of watching Jaws 47 times",
  "May the sharks remember your generosity",
  "To the bravest ankle-deep swimmer I know",
];

function PurchaseFlowInner() {
  const t = useTranslations("purchase");
  const searchParams = useSearchParams();
  const locale = useLocale();

  const initialTier = (searchParams.get("tier") as Tier) || "protected";
  const initialName = searchParams.get("name") || "";
  const initialGift = searchParams.get("gift") === "true";
  const referredByCode = searchParams.get("ref") || "";
  const wasCanceled = searchParams.get("canceled") === "true";

  const [tier, setTier] = useState<Tier>(initialTier);
  const [name, setName] = useState(initialName);
  const [dedication, setDedication] = useState("");
  const [email, setEmail] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [giftDeliveryDate, setGiftDeliveryDate] = useState("");
  const [isGift, setIsGift] = useState(initialGift);
  const [promoCode, setPromoCode] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState("");
  const [showEmailWarning, setShowEmailWarning] = useState(false);
  const [template, setTemplate] = useState<CertificateTemplate>("hero");

  const tierPrices: Record<Tier, string> = {
    basic: "$9",
    protected: "$9",
    nonsnack: "$29",
    business: "$99",
  };

  const tierValues: Record<Tier, number> = {
    basic: 9,
    protected: 9,
    nonsnack: 29,
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

  const tierIcons: Record<Tier, string> = {
    basic: "🐟",
    protected: "🛡️",
    nonsnack: "🚫",
    business: "🏢",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    // If no email and warning not yet confirmed, show warning instead of submitting
    if (!email.trim() && !showEmailWarning) {
      setShowEmailWarning(true);
      trackEvent("no_email_warning_shown", { tier });
      return;
    }

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
          referredBy: referredByCode || undefined,
          locale,
          promoCode: promoCode.trim() || undefined,
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

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (isRedirecting) {
    return (
      <section className="py-32">
        <div className="mx-auto max-w-lg px-6 text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-sky-200 border-t-[var(--brand)]" />
          <p className="mt-8 text-lg font-semibold text-[var(--brand-dark)]">
            {t("redirecting")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-lg text-[var(--muted)]">
            {t("subtitle")}
          </p>
        </div>

        {/* Canceled notice */}
        {wasCanceled && (
          <div className="mt-6 mx-auto max-w-md rounded-xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-center text-sm text-amber-800">
            {t("canceledNotice")}
          </div>
        )}

        {/* Referral badge */}
        {referredByCode && (
          <div className="mt-6 mx-auto max-w-md rounded-full border border-teal-200 bg-teal-50/50 px-5 py-3 text-center text-sm text-teal-700">
            🤝 {t("referredByBadge")}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 mx-auto max-w-md rounded-xl border border-red-200 bg-red-50/50 px-5 py-4 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tier selector */}
            <div>
              <label className="text-sm font-semibold text-[var(--brand-dark)]">
                {t("tierLabel")}
              </label>
              <div className="mt-2 grid gap-3 grid-cols-3">
                {(["protected", "nonsnack", "business"] as Tier[]).map((tierOption) => {
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
                      className={`rounded-xl border ${colors[tierOption]} p-4 text-center transition hover:shadow-md`}
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
            <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
              <button
                type="button"
                onClick={() => { const next = !isGift; setIsGift(next); trackEvent("gift_toggle", { tier, enabled: next }); }}
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
                type="text"
                value={dedication}
                onChange={(e) => setDedication(e.target.value)}
                placeholder={tier === "business" ? t("businessDedicationPlaceholder") : t("dedicationPlaceholder")}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-5 py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
              {tier !== "business" && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {DEDICATION_SUGGESTIONS.slice(0, 3).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setDedication(suggestion)}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)] transition hover:border-sky-300 hover:bg-sky-50 hover:text-[var(--brand-dark)]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <label htmlFor="email" className="text-sm font-semibold text-[var(--brand-dark)]">
                  {t("emailLabel")}
                </label>
                <span className="text-xs text-[var(--muted)]">{t("emailOptionalTag")}</span>
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setShowEmailWarning(false); }}
                placeholder={t("emailPlaceholder")}
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-5 py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
              <p className="mt-1.5 text-xs text-[var(--muted)]">{t("emailOptionalHint")}</p>
            </div>

            {/* Gift fields */}
            {isGift && (
              <div className="space-y-4 rounded-xl border border-orange-100 bg-orange-50/30 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">🎁 {t("giftDetailsTitle")}</p>
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
                    className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-5 py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                  />
                </div>
                <div>
                  <label htmlFor="giftDeliveryDate" className="text-sm font-semibold text-[var(--brand-dark)]">
                    {t("giftDeliveryDateLabel")}
                  </label>
                  <input
                    id="giftDeliveryDate"
                    type="date"
                    value={giftDeliveryDate}
                    onChange={(e) => setGiftDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-5 py-4 text-sm text-[var(--foreground)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                  />
                </div>
                <div>
                  <label htmlFor="giftMessage" className="text-sm font-semibold text-[var(--brand-dark)]">
                    {t("giftMessageLabel")}
                  </label>
                  <textarea
                    id="giftMessage"
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
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-form-type="other"
                data-lpignore="true"
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-5 py-4 text-sm font-mono text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 uppercase"
              />
            </div>

            {/* Stripe secure payment note */}
            <div className="flex items-center gap-3 rounded-xl border border-teal-100 bg-teal-50/30 p-4">
              <span className="text-lg">🔒</span>
              <div>
                <p className="text-sm font-semibold text-[var(--brand-dark)]">
                  {t("stripeSecure")}
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  {t("stripeSecureNote")}
                </p>
              </div>
            </div>

            {/* No-email warning */}
            {showEmailWarning && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">⚠️ {t("noEmailWarningTitle")}</p>
                <p className="mt-1 text-sm leading-6 text-amber-700">{t("noEmailWarningText")}</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800"
                  >
                    {t("noEmailContinue")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailWarning(false);
                      document.getElementById("email")?.focus();
                    }}
                    className="flex-1 rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-50"
                  >
                    {t("noEmailAddEmail")}
                  </button>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!name.trim() || isRedirecting}
              className="w-full rounded-lg bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white transition hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {promoCode.trim()
                ? t("submitButtonPromo")
                : `${t("submitButton")} — ${tierPrices[tier]}`}
            </button>
          </form>

          {/* Live certificate preview */}
          <div className="hidden lg:block">
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
