"use client";

import { useTranslations } from "next-intl";

export function FaqContent() {
  const t = useTranslations("faqPage");

  const items = Array.from({ length: 8 }, (_, i) => ({
    question: t(`items.${i}.question`),
    answer: t(`items.${i}.answer`),
  }));

  return (
    <>
      {/* Hero */}
      <section className="py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-6">
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
        <div className="mx-auto max-w-4xl px-6">
          <div className="space-y-6">
            {items.map((item) => (
              <article
                key={item.question}
                className="rounded-[2rem] border border-sky-100 bg-white p-8 shadow-[0_16px_50px_rgba(25,87,138,0.08)]"
              >
                <h2 className="text-xl font-semibold text-[var(--brand-dark)]">
                  {item.question}
                </h2>
                <p className="mt-4 text-base leading-7 text-[var(--muted)]">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-[2.25rem] border border-sky-900/30 bg-[var(--brand-dark)] px-8 py-12 text-center text-white shadow-[0_22px_80px_rgba(15,39,64,0.25)] sm:px-12">
            <h2 className="text-3xl font-semibold tracking-tight">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-sky-100/80">
              {t("ctaText")}
            </p>
            <div className="mt-6">
              <a
                href="/purchase?tier=protected"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/30 transition hover:bg-[var(--accent-dark)] hover:shadow-xl"
              >
                🛡️ {t("ctaButton")}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
