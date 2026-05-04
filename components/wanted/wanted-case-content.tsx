"use client";

import { CertificatePreview } from "@/components/certificate/certificate-preview";
import { LocalizedLink } from "@/components/ui/localized-link";
import { getTierPriceLabel } from "@/lib/tiers";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

type WantedCaseTone = "mild" | "clear" | "emergency";

const WANTED_CASE_TONES: WantedCaseTone[] = ["mild", "clear", "emergency"];

function nameHash(name: string): number {
  let hash = 0;
  const source = name || "default";
  for (let i = 0; i < source.length; i++) {
    hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function normalizeTone(value?: string): WantedCaseTone {
  return WANTED_CASE_TONES.includes(value as WantedCaseTone)
    ? (value as WantedCaseTone)
    : "clear";
}

function normalizeName(value: string | undefined, fallback: string) {
  const normalized = (value || "").replace(/\s+/g, " ").trim();
  return normalized ? normalized.slice(0, 80) : fallback;
}

type WantedCaseContentProps = {
  initialName?: string;
  initialTone?: string;
  certificateDate: string;
};

export function WantedCaseContent({
  initialName,
  initialTone,
  certificateDate,
}: WantedCaseContentProps) {
  const t = useTranslations("wantedCase");
  const wantedT = useTranslations("wanted");
  const locale = useLocale();
  const tone = normalizeTone(initialTone);
  const displayName = normalizeName(initialName, wantedT("defaultName"));
  const caseNumber = `SHA-${nameHash(`${displayName}:${tone}`)
    .toString()
    .slice(-4)
    .padStart(4, "0")}`;

  const purchaseHref = useMemo(() => {
    const params = new URLSearchParams({
      tier: "protected",
      gift: "true",
      ref: "wanted",
      name: displayName,
    });
    return `/purchase?${params.toString()}`;
  }, [displayName]);

  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface-soft)]/55 py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.72fr)] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--section-label)]">
              {t("eyebrow")}
            </p>

            <div className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-[#f6ecd8] p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  {t("caseFileLabel")}
                </p>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {caseNumber}
                </p>
              </div>

              <h1 className="mt-6 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl sm:leading-[1.08]">
                {t("headline")}
              </h1>

              <p className="mt-5 text-4xl font-black leading-none tracking-tight text-[var(--brand-dark)] sm:text-6xl">
                {displayName}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="border-t border-dashed border-[var(--muted)]/55 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    {wantedT("caseStatusLabel")}
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-[var(--brand-dark)]">
                    {wantedT(`tones.${tone}.caseStatus`)}
                  </p>
                </div>
                <div className="border-t border-dashed border-[var(--muted)]/55 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    {wantedT("riskLevelLabel")}
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-[var(--brand-dark)]">
                    {wantedT(`tones.${tone}.riskLevel`)}
                  </p>
                </div>
                <div className="border-t border-dashed border-[var(--muted)]/55 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    {wantedT("recommendedActionLabel")}
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-[var(--brand-dark)]">
                    {wantedT(`tones.${tone}.recommendedAction`)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--section-label)]">
                {t("findingLabel")}
              </p>
              <p className="mt-3 text-base font-semibold leading-7 text-[var(--brand-dark)]">
                {t("finding", { name: displayName })}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {t("explanation")}
              </p>

              <div className="mt-5 border-t border-[var(--border)] pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--section-label)]">
                {t("resolutionLabel")}
                </p>
                <h2 className="mt-3 text-base font-semibold leading-7 text-[var(--brand-dark)]">
                  {t("resolutionTitle")}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {t("resolutionText", { name: displayName })}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <LocalizedLink
                    href={purchaseHref}
                    className="inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:whitespace-nowrap"
                  >
                    {t("cta", { price: getTierPriceLabel("protected") })}
                  </LocalizedLink>
                  <p className="text-sm leading-6 text-[var(--muted)]">
                    {t("priceNote")}
                  </p>
                </div>

              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--section-label)]">
              {t("previewLabel")}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {t("previewText")}
            </p>
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
              <CertificatePreview
                name={displayName}
                tier="protected"
                dedication={t("certificateDedication")}
                date={certificateDate}
                registryId={caseNumber}
                template="luxury"
                paperFormat="a4"
                locale={locale}
              />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
