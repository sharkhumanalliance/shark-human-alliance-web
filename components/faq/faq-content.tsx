"use client";

import { useMessages, useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";
import { useState } from "react";

export function FaqContent() {
  const t = useTranslations("faqPage");
  const messages = useMessages() as Record<string, unknown>;
  const faqItems = ((messages.faqPage as { items?: Array<{ question: string; answer: string }> })?.items ?? []);
  const items = faqItems.map((_, i) => ({
    question: t(`items.${i}.question`),
    answer: t(`items.${i}.answer`),
  }));

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <>
      <section data-reveal className="bg-[var(--surface-soft)] py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--section-label)]">
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

      <section data-reveal className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="space-y-3">
            {items.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <article
                  key={item.question}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] shadow-sm transition-shadow hover:shadow-md"
                >
                  <button
                    onClick={() => toggle(idx)}
                    className="flex w-full items-center justify-between px-5 py-5 text-left sm:px-6"
                    aria-expanded={isOpen}
                  >
                    <h2 className="text-lg font-semibold text-[var(--brand-dark)] pr-4">
                      {item.question}
                    </h2>
                    <span
                      className={`shrink-0 text-[var(--muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <p className="px-5 pb-5 text-sm leading-6 text-[var(--muted)] sm:px-6">
                      {item.answer}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section data-reveal className="pb-16 pt-4">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50/60 to-[var(--surface-soft)] px-5 py-10 sm:px-8 sm:py-12 sm:px-12">
            <h2 className="max-w-3xl text-left text-3xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("ctaTitle")}
            </h2>
            <p className="mt-3 max-w-lg text-left text-base leading-7 text-[var(--muted)]">
              {t("ctaText")}
            </p>
            <div className="mt-6">
              <LocalizedLink
                href="/purchase?tier=protected"
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-4 text-base font-bold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:w-auto sm:px-8 sm:text-lg"
              >
                {t("ctaButton")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
