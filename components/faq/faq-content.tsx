"use client";

import { useMessages, useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";

export function FaqContent() {
  const t = useTranslations("faqPage");
  const messages = useMessages() as Record<string, unknown>;
  const faqItems = ((messages.faqPage as { items?: Array<{ question: string; answer: string }> })?.items ?? []);
  const items = faqItems.map((_, i) => ({
    question: t(`items.${i}.question`),
    answer: t(`items.${i}.answer`),
  }));

  return (
    <>
      {/* Hero */}
      <section className="py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("label")}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-3 text-lg leading-7 text-[var(--muted)]">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="pb-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.question}
                className="rounded-xl border border-[var(--border)] bg-white px-6 py-5 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-[var(--brand-dark)]">
                  {item.question}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-xl border border-sky-900/30 bg-[var(--brand-dark)] px-8 py-12 text-center text-white sm:px-12">
            <h2 className="text-3xl font-semibold tracking-tight">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-sky-100/80">
              {t("ctaText")}
            </p>
            <div className="mt-6">
              <LocalizedLink
                href="/purchase?tier=protected"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-8 py-4 text-lg font-bold text-white transition hover:bg-[var(--accent-dark)]"
              >
                🛡️ {t("ctaButton")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
