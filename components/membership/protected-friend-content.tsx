"use client";

import { useTranslations } from "next-intl";

export function ProtectedFriendContent() {
  const t = useTranslations("protectedPage");

  const includedItems = Array.from({ length: 4 }, (_, i) => t(`includedItems.${i}`));

  const faqItems = Array.from({ length: 3 }, (_, i) => ({
    question: t(`faqItems.${i}.question`),
    answer: t(`faqItems.${i}.answer`),
  }));

  return (
    <>
      <section className="py-14 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-medium text-[var(--brand-dark)] shadow-sm">
              {t("badge")}
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
              {t("title")}
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-7 text-[var(--muted)]">
              {t("description")}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="/purchase?tier=protected"
                className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-4 text-base font-semibold text-white transition hover:bg-[var(--brand-dark)]"
              >
                {t("ctaPrimary")}
              </a>
              <a
                href="/membership"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:border-sky-300 hover:bg-sky-50"
              >
                {t("ctaSecondary")}
              </a>
            </div>

            <p className="mt-5 text-sm text-[var(--muted)]">
              {t("recommended")}
            </p>
          </div>

          <div className="rounded-[2rem] border border-sky-100 bg-white p-8 shadow-[0_24px_80px_rgba(25,87,138,0.12)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-800">
              {t("includedLabel")}
            </p>

            <p className="mt-4 text-4xl font-semibold text-[var(--brand-dark)]">
              $9
            </p>

            <ul className="mt-8 space-y-4">
              {includedItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-7 text-[var(--foreground)]"
                >
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--brand)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-[1.5rem] border border-teal-100 bg-teal-50/60 p-5">
              <p className="text-sm font-semibold text-[var(--brand-dark)]">
                {t("bestUseTitle")}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                {t("bestUseText")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-800">
              {t("whyLabel")}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("whyTitle")}
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
              {t("whyDescription")}
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { step: "01", title: t("reason1Title"), text: t("reason1Text"), borderColor: "border-sky-100", stepColor: "text-sky-700" },
              { step: "02", title: t("reason2Title"), text: t("reason2Text"), borderColor: "border-cyan-100", stepColor: "text-cyan-700" },
              { step: "03", title: t("reason3Title"), text: t("reason3Text"), borderColor: "border-orange-100", stepColor: "text-orange-700" },
            ].map((item) => (
              <article key={item.step} className={`rounded-[2rem] border ${item.borderColor} bg-white p-6 shadow-[0_16px_50px_rgba(25,87,138,0.08)]`}>
                <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${item.stepColor}`}>
                  {item.step}
                </p>
                <h3 className="mt-4 text-xl font-semibold text-[var(--brand-dark)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="buy" className="py-14">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-[2.25rem] border border-sky-900/30 bg-[var(--brand-dark)] px-8 py-12 text-white shadow-[0_22px_80px_rgba(15,39,64,0.25)] sm:px-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">
              {t("buyLabel")}
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight">
              {t("buyTitle")}
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-sky-100/90">
              {t("buyText")}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="/membership"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:bg-sky-50"
              >
                {t("buyCtaPrimary")}
              </a>
              <a
                href="/#faq"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10"
              >
                {t("buyCtaSecondary")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-800">
              {t("faqLabel")}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("faqTitle")}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-[0_16px_50px_rgba(25,87,138,0.08)]"
              >
                <h3 className="text-xl font-semibold text-[var(--brand-dark)]">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
