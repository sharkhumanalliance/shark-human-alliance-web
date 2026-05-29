"use client";

import { useEffect, useRef, useState } from "react";
import { LocalizedLink } from "@/components/ui/localized-link";
import { trackEvent } from "@/components/analytics";
import { useLocale, useTranslations } from "next-intl";

type GiftRevealContentProps = {
  to?: string;
  from?: string;
  message?: string;
  token?: string;
};

function clean(value: string | undefined, max = 80): string {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function GiftRevealContent({
  to,
  from,
  message,
  token,
}: GiftRevealContentProps) {
  const t = useTranslations("giftReveal");
  const locale = useLocale();

  const toName = clean(to) || t("defaultTo");
  const fromName = clean(from);
  const giftMessage = clean(message, 600);
  const certToken = clean(token, 128).replace(/[^a-fA-F0-9]/g, "");

  const [revealed, setRevealed] = useState(false);

  const viewedRef = useRef(false);
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    trackEvent("gift_reveal_view", {
      locale,
      personalized: clean(to).length > 0,
      has_message: giftMessage.length > 0,
      has_token: certToken.length > 0,
    });
  }, [locale, to, giftMessage.length, certToken.length]);

  function handleOpen() {
    setRevealed(true);
    trackEvent("gift_reveal_opened", { locale });
  }

  const certificateHref = certToken
    ? `/certificate/view?token=${certToken}&download=1`
    : null;

  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface-soft)]/55 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--section-label)]">
          {t("eyebrow")}
        </p>

        {!revealed ? (
          <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[#f6ecd8] p-8 text-center shadow-sm sm:p-12">
            <div
              aria-hidden="true"
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-[var(--accent)]/40 bg-white text-3xl shadow-inner"
            >
              🎁
            </div>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-3xl">
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
              className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[var(--accent)] px-8 py-3 text-base font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:w-auto"
            >
              {t("openButton")}
            </button>
          </div>
        ) : (
          <div className="mt-6 animate-[fadeIn_0.5s_ease-out] rounded-3xl border border-[var(--border)] bg-white p-8 text-center shadow-sm sm:p-12">
            <div
              aria-hidden="true"
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[var(--accent)] bg-[var(--surface-soft)] text-2xl"
            >
              🦈
            </div>
            <h1 className="mt-6 text-2xl font-black tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("revealedHeadline", { name: toName })}
            </h1>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              {t("revealedSubtitle")}
            </p>

            {fromName ? (
              <p className="mt-5 inline-flex items-center rounded-full border border-[var(--accent)]/40 bg-[var(--surface-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--brand-dark)]">
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
                    trackEvent("gift_reveal_certificate_click", { locale })
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
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </section>
  );
}
