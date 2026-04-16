"use client";

import { useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";

export function ProtectedFriendContent() {
  const t = useTranslations("protectedPage");

  const includedItems = Array.from({ length: 4 }, (_, i) => t(`includedItems.${i}`));

  const faqItems = Array.from({ length: 3 }, (_, i) => ({
    question: t(`faqItems.${i}.question`),
    answer: t(`faqItems.${i}.answer`),
  }));

  return (
    <>
      <section data-reveal className="py-12 sm:py-14 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--brand-dark)]">
              {t("badge")}
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
              {t("title")}
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-7 text-[var(--muted)]">
              {t("description")}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <LocalizedLink
                href="/purchase?tier=protected"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-lg bg-[var(--brand)] px-6 py-4 text-base font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--brand-dark)] sm:w-auto"
              >
                {t("ctaPrimary")}
              </LocalizedLink>
              <LocalizedLink
                href="/membership"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-lg border border-[var(--border)] bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-sky-50 sm:w-auto"
              >
                {t("ctaSecondary")}
              </LocalizedLink>
            </div>

            <p className="mt-5 text-sm text-[var(--muted)]">
              {t("recommended")}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-800">
              {t("includedLabel")}
            </p>

            <p className="mt-4 text-3xl font-semibold text-[var(--brand-dark)] sm:text-4xl">
              $4
            </p>

            <ul className="mt-8 space-y-4">
              {includedItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-6 text-[var(--foreground)]"
                >
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--brand)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-lg border border-[var(--border)] bg-teal-50/60 p-5">
              <p className="text-sm font-semibold text-[var(--brand-dark)]">
                {t("bestUseTitle")}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {t("bestUseText")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section data-reveal className="py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-800">
              {t("whyLabel")}
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("whyTitle")}
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
              {t("whyDescription")}
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { step: "01", title: t("reason1Title"), text: t("reason1Text"), borderColor: "border-[var(--border)]", stepColor: "text-sky-700" },
              { step: "02", title: t("reason2Title"), text: t("reason2Text"), borderColor: "border-[var(--border)]", stepColor: "text-cyan-700" },
              { step: "03", title: t("reason3Title"), text: t("reason3Text"), borderColor: "border-[var(--border)]", stepColor: "text-orange-700" },
            ].map((item) => (
              <article data-reveal key={item.step} className={`rounded-xl border ${item.borderColor} bg-white p-6 shadow-sm`}>
                <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${item.stepColor}`}>
                  {item.step}
                </p>
                <h3 className="mt-4 text-xl font-semibold text-[var(--brand-dark)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-reveal id="buy" className="py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-xl border border-sky-900/30 bg-[var(--brand-dark)] px-5 py-10 text-white sm:px-8 sm:py-12 sm:px-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">
              {t("buyLabel")}
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("buyTitle")}
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-sky-100/90">
              {t("buyText")}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <LocalizedLink
                href="/membership"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-lg bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-sky-50 sm:w-auto"
              >
                {t("buyCtaPrimary")}
              </LocalizedLink>
              <LocalizedLink
                href="/#faq"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-lg border border-white/30 px-6 py-4 text-base font-semibold text-white transition-colors duration-300 ease-out hover:bg-white/10 sm:w-auto"
              >
                {t("buyCtaSecondary")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>

      <section data-reveal className="py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-800">
              {t("faqLabel")}
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("faqTitle")}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-[var(--brand-dark)]">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
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
