"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationEvent } from "react";
import { CertificatePreview } from "@/components/certificate/certificate-preview";
import { LocalizedLink } from "@/components/ui/localized-link";
import { trackEvent } from "@/components/analytics";
import type { CertificateTemplate } from "@/lib/certificate-templates";
import { useLocale, useTranslations } from "next-intl";
import { ANALYTICS_SOURCES } from "@/lib/analytics-events";
import { getPublicTierKey } from "@/lib/tiers";

export type GiftCertificate = {
  name: string;
  tier: string;
  dedication: string;
  date: string;
  registryId: string;
  template: CertificateTemplate;
};

type GiftRevealContentProps = {
  to?: string;
  from?: string;
  message?: string;
  token?: string;
  certificate?: GiftCertificate;
};

function clean(value: string | undefined, max = 80): string {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function WaxSeal() {
  // The seal is two clipped halves stacked over each other so it can crack
  // straight down the middle and fall apart when the gift is opened.
  // Each half shows the Bureau seal artwork (public/seal-gift.webp).
  return (
    <div className="gr-seal" aria-hidden="true">
      <span className="gr-seal__half gr-seal__half--left">
        <span className="gr-seal__face" />
      </span>
      <span className="gr-seal__half gr-seal__half--right">
        <span className="gr-seal__face" />
      </span>
      <span className="gr-seal__crack" />
      <span className="gr-seal__burst" />
    </div>
  );
}

export function GiftRevealContent({
  to,
  from,
  message,
  token,
  certificate,
}: GiftRevealContentProps) {
  const t = useTranslations("giftReveal");
  const locale = useLocale();

  // Prefer the real certificate's name when we have it; fall back to the URL.
  const toName = certificate?.name || clean(to) || t("defaultTo");
  const fromName = clean(from);
  const giftMessage = clean(message, 600);
  const certToken = clean(token, 128).replace(/[^a-fA-F0-9]/g, "");
  const bare = !clean(to) && !fromName && !certToken && !certificate;

  const [revealed, setRevealed] = useState(false);
  const [breaking, setBreaking] = useState(false);
  const fallbackRef = useRef<number | null>(null);

  const viewedRef = useRef(false);
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    trackEvent("gift_reveal_view", {
      source: ANALYTICS_SOURCES.giftReveal,
      locale,
      bare,
      personalized: clean(to).length > 0,
      has_message: giftMessage.length > 0,
      has_token: certToken.length > 0,
      has_certificate: Boolean(certificate),
    });
  }, [bare, locale, to, giftMessage.length, certToken.length, certificate]);

  useEffect(() => {
    return () => {
      if (fallbackRef.current) window.clearTimeout(fallbackRef.current);
    };
  }, []);

  function handleOpen() {
    trackEvent("gift_reveal_opened", {
      source: ANALYTICS_SOURCES.giftReveal,
      locale,
    });

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setRevealed(true);
      return;
    }

    setBreaking(true);
    // Safety net in case the animationend event is missed (e.g. tab blur).
    fallbackRef.current = window.setTimeout(() => setRevealed(true), 1300);
  }

  function handleSealAnimationEnd(event: AnimationEvent<HTMLSpanElement>) {
    if (event.animationName === "grSealBreakLeft") {
      if (fallbackRef.current) window.clearTimeout(fallbackRef.current);
      setRevealed(true);
    }
  }

  const certificateHref = certToken
    ? `/certificate/view?token=${certToken}&download=1`
    : null;

  if (bare) {
    return (
      <section className="border-b border-[var(--border)] bg-[var(--surface-soft)]/55 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--section-label)]">
            {t("eyebrow")}
          </p>
          <div className="mt-6 rounded-3xl border border-[#3A2515]/15 bg-white p-8 shadow-sm sm:p-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/seal-gift.webp"
              alt=""
              aria-hidden="true"
              className="mx-auto h-20 w-20"
            />
            <h1 className="mt-6 text-2xl font-black tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("bareTitle")}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[var(--muted)]">
              {t("bareText")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <LocalizedLink
                href="/purchase?gift=true&from=gift_reveal"
                onClick={() =>
                  trackEvent("gift_reveal_bare_gift_click", {
                    source: ANALYTICS_SOURCES.giftReveal,
                    locale,
                    is_gift: true,
                  })
                }
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[var(--accent)] px-8 py-3 text-base font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)]"
              >
                {t("bareGiftCta")}
              </LocalizedLink>
              <LocalizedLink
                href="/"
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-[var(--border)] bg-white px-8 py-3 text-base font-semibold text-[var(--brand-dark)] transition hover:bg-[var(--surface-soft)]"
              >
                {t("exploreCta")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface-soft)]/55 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--section-label)]">
          {t("eyebrow")}
        </p>

        {!revealed ? (
          <div className="mt-6 overflow-hidden rounded-3xl border border-[#3A2515]/20 bg-[#f6ecd8] p-8 text-center shadow-sm sm:p-12">
            <div
              className={`gr-seal-stage${breaking ? " gr-seal-stage--breaking" : ""}`}
              onAnimationEnd={handleSealAnimationEnd}
            >
              <WaxSeal />
            </div>

            <div
              className={`gr-seal-copy${breaking ? " gr-seal-copy--breaking" : ""}`}
            >
              <h1 className="mt-7 text-2xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-3xl">
                {t("sealedTitle", { name: toName })}
              </h1>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                {fromName
                  ? t("sealedSubtitleFrom", { name: fromName })
                  : t("sealedSubtitle")}
              </p>
              <button
                type="button"
                onClick={handleOpen}
                disabled={breaking}
                className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[var(--accent)] px-8 py-3 text-base font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] disabled:cursor-default disabled:opacity-70 sm:w-auto"
              >
                {t("openButton")}
              </button>
            </div>
          </div>
        ) : (
          <div className="gr-reveal mt-6 rounded-3xl border border-[#3A2515]/15 bg-[#FFFDF7] p-8 text-center shadow-sm sm:p-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/seal-gift.webp"
              alt=""
              aria-hidden="true"
              className="mx-auto h-20 w-20"
            />
            <h1 className="mt-6 text-2xl font-black tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("revealedHeadline", { name: toName })}
            </h1>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              {/* Tier-aware: the gift can be any tier, so the subtitle must
                  match the real certificate. Falls back to the generic
                  Protected line for legacy links without a certificate. */}
              {certificate
                ? t(`revealedSubtitles.${getPublicTierKey(certificate.tier)}`)
                : t("revealedSubtitle")}
            </p>

            {certificate ? (
              <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[#3A2515]/15 bg-[#F6ECD8] p-3 shadow-[0_18px_40px_rgba(58,37,21,0.14)] sm:p-4">
                <CertificatePreview
                  name={certificate.name}
                  tier={certificate.tier}
                  dedication={certificate.dedication}
                  date={certificate.date}
                  registryId={certificate.registryId}
                  template={certificate.template}
                  paperFormat="a4"
                  locale={locale}
                />
              </div>
            ) : null}

            {fromName ? (
              <p className="mt-6 inline-flex items-center rounded-full border border-[var(--accent)]/40 bg-[var(--surface-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--brand-dark)]">
                {t("fromLabel", { name: fromName })}
              </p>
            ) : null}

            {giftMessage ? (
              <div className="mt-6 border-l-4 border-[var(--accent)] bg-[var(--surface-soft)]/60 px-5 py-4 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
                  {t("messageLabel")}
                </p>
                <p className="mt-2 whitespace-pre-line text-base leading-7 text-[var(--brand-dark)]">
                  {giftMessage}
                </p>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col items-center gap-3">
              {certificateHref ? (
                <LocalizedLink
                  href={certificateHref}
                  onClick={() =>
                    trackEvent("gift_reveal_certificate_click", {
                      source: ANALYTICS_SOURCES.giftReveal,
                      locale,
                    })
                  }
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[var(--accent)] px-8 py-3 text-base font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:w-auto"
                >
                  {t("certificateCta")}
                </LocalizedLink>
              ) : null}
              <LocalizedLink
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center text-sm font-semibold text-[var(--section-label)] transition hover:text-[var(--brand-dark)]"
              >
                {t("exploreCta")}
              </LocalizedLink>
            </div>
          </div>
        )}

        {revealed ? (
          <div className="gr-reveal-late mt-4 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)]/40 p-6 text-center sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
              {t("yourTurnLabel")}
            </p>
            <p className="mt-2 text-base leading-7 text-[var(--brand-dark)]">
              {t("yourTurnText")}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <LocalizedLink
                href="/purchase?gift=true&from=gift_reveal"
                onClick={() =>
                  trackEvent("gift_reveal_protect_back_click", {
                    source: ANALYTICS_SOURCES.giftReveal,
                    tier: "protected",
                    locale,
                  })
                }
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)]"
              >
                {t("protectBackCta")}
              </LocalizedLink>
              <LocalizedLink
                href="/wanted"
                onClick={() =>
                  trackEvent("gift_reveal_wanted_click", {
                    source: ANALYTICS_SOURCES.giftReveal,
                    locale,
                  })
                }
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-red-300 bg-white px-6 py-3 text-sm font-semibold text-red-700 transition-colors duration-300 ease-out hover:bg-red-50"
              >
                {t("wantedCta")}
              </LocalizedLink>
            </div>
          </div>
        ) : null}
      </div>

      <style>{`
        .gr-seal-stage {
          margin: 0 auto;
          width: 140px;
          height: 140px;
        }
        .gr-seal {
          position: relative;
          width: 140px;
          height: 140px;
          margin: 0 auto;
        }
        .gr-seal__half {
          position: absolute;
          inset: 0;
          display: block;
          will-change: transform, opacity;
        }
        .gr-seal__half--left { clip-path: inset(0 50% 0 0); }
        .gr-seal__half--right { clip-path: inset(0 0 0 50%); }
        .gr-seal__face {
          position: absolute;
          inset: 0;
          background: url("/seal-gift.webp") center / contain no-repeat;
          filter: drop-shadow(0 10px 14px rgba(55, 58, 64, 0.35));
        }
        .gr-seal__crack {
          position: absolute;
          top: 4px;
          bottom: 4px;
          left: calc(50% - 1px);
          width: 2px;
          border-radius: 2px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(255, 255, 255, 0.9),
            transparent
          );
          opacity: 0;
        }
        .gr-seal__burst {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid #9aa1ab;
          opacity: 0;
          transform: scale(0.4);
        }

        .gr-seal-stage--breaking .gr-seal { animation: grSealShudder 0.26s ease-in-out; }
        .gr-seal-stage--breaking .gr-seal__crack { animation: grCrackFlash 0.3s ease-out 0.04s; }
        .gr-seal-stage--breaking .gr-seal__burst { animation: grBurst 0.7s ease-out 0.28s; }
        .gr-seal-stage--breaking .gr-seal__half--left {
          animation: grSealBreakLeft 0.85s cubic-bezier(0.5, 0, 0.3, 1) 0.26s forwards;
        }
        .gr-seal-stage--breaking .gr-seal__half--right {
          animation: grSealBreakRight 0.85s cubic-bezier(0.5, 0, 0.3, 1) 0.26s forwards;
        }
        .gr-seal-copy { transition: opacity 0.3s ease; }
        .gr-seal-copy--breaking { opacity: 0.35; pointer-events: none; }

        @keyframes grSealShudder {
          0%, 100% { transform: translateX(0) rotate(0); }
          25% { transform: translateX(-2px) rotate(-1.2deg); }
          50% { transform: translateX(2px) rotate(1.2deg); }
          75% { transform: translateX(-1px) rotate(-0.6deg); }
        }
        @keyframes grCrackFlash {
          0% { opacity: 0; }
          45% { opacity: 0.95; }
          100% { opacity: 0; }
        }
        @keyframes grBurst {
          0% { transform: scale(0.4); opacity: 0.5; }
          100% { transform: scale(1.85); opacity: 0; }
        }
        @keyframes grSealBreakLeft {
          0% { transform: translate(0, 0) rotate(0); opacity: 1; }
          16% { transform: translate(-3px, -2px) rotate(-3deg); opacity: 1; }
          100% { transform: translate(-48px, 60px) rotate(-36deg); opacity: 0; }
        }
        @keyframes grSealBreakRight {
          0% { transform: translate(0, 0) rotate(0); opacity: 1; }
          16% { transform: translate(3px, -2px) rotate(3deg); opacity: 1; }
          100% { transform: translate(48px, 60px) rotate(36deg); opacity: 0; }
        }

        .gr-reveal { animation: grRevealIn 0.55s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
        .gr-reveal-late { animation: grRevealIn 0.55s cubic-bezier(0.2, 0.7, 0.2, 1) 0.12s both; }
        @keyframes grRevealIn {
          0% { opacity: 0; transform: translateY(14px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .gr-seal-stage--breaking .gr-seal,
          .gr-seal-stage--breaking .gr-seal__half--left,
          .gr-seal-stage--breaking .gr-seal__half--right,
          .gr-seal-stage--breaking .gr-seal__crack,
          .gr-seal-stage--breaking .gr-seal__burst,
          .gr-reveal,
          .gr-reveal-late {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
