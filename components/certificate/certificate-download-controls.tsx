"use client";

import { useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";
import type { PaperFormat } from "@/lib/certificate-paper";

type CertificateDownloadControlsProps = {
  paperFormat: PaperFormat;
  a4Href: string;
  letterHref: string;
  isLetterAvailable: boolean;
};

export function CertificateDownloadControls({
  paperFormat,
  a4Href,
  letterHref,
  isLetterAvailable,
}: CertificateDownloadControlsProps) {
  const t = useTranslations("certificateDownload");

  function printCertificate() {
    window.print();
  }

  const options: Array<{
    value: PaperFormat;
    label: string;
    href: string;
    disabled?: boolean;
  }> = [
    {
      value: "a4",
      label: t("a4"),
      href: a4Href,
    },
    {
      value: "letter",
      label: t("letter"),
      href: letterHref,
      disabled: !isLetterAvailable,
    },
  ];

  return (
    <section className="mx-auto mb-6 max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm print:hidden sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-2xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            {t("description")}
          </p>
        </div>
        <button
          type="button"
          onClick={printCertificate}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
        >
          {t("printButton")}
        </button>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-[var(--brand-dark)]">
          {t("paperLabel")}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:inline-grid sm:min-w-[320px]">
          {options.map((option) => {
            const isSelected = option.value === paperFormat;

            if (isSelected) {
              return (
                <span
                  key={option.value}
                  aria-current="true"
                  className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-[var(--brand)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--brand-dark)]"
                >
                  {option.label}
                </span>
              );
            }

            if (option.disabled) {
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled
                  title={t("unavailable")}
                  className="inline-flex min-h-[42px] cursor-not-allowed items-center justify-center rounded-lg border border-[var(--border)] bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500"
                >
                  {option.label}
                </button>
              );
            }

            return (
              <LocalizedLink
                key={option.value}
                href={option.href}
                className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-dark)] transition hover:bg-[var(--surface-soft)]"
              >
                {option.label}
              </LocalizedLink>
            );
          })}
        </div>
        {!isLetterAvailable ? (
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            {t("unavailable")}
          </p>
        ) : null}
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          {t("printHint")}
        </p>
      </div>
    </section>
  );
}
