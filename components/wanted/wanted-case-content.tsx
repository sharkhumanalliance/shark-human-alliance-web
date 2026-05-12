"use client";

import { CertificatePreview } from "@/components/certificate/certificate-preview";
import { LocalizedLink } from "@/components/ui/localized-link";
import { getTierPriceLabel } from "@/lib/tiers";
import { useLocale, useTranslations } from "next-intl";

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
  const shortName = displayName.split(/\s+/)[0] || displayName;
  const caseNumber = `CASE SHA-${nameHash(`${displayName}:${tone}`)
    .toString()
    .slice(-4)
    .padStart(4, "0")}`;

  const purchaseParams = new URLSearchParams({
    tier: "protected",
    gift: "true",
    ref: "wanted",
    name: displayName,
  });
  const purchaseHref = `/purchase?${purchaseParams.toString()}`;

  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface-soft)]/55 py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
              {t("eyebrow")}
            </p>

            <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[#f6ecd8] p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {t("caseFileLabel")}
                </p>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {caseNumber}
                </p>
              </div>

              <h1 className="mt-5 max-w-2xl text-2xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-3xl sm:leading-[1.09]">
                {t("headline")}
              </h1>

              <p className="mt-4 text-4xl font-black leading-none tracking-tight text-[var(--brand-dark)] sm:text-5xl">
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
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
                {t("findingLabel")}
              </p>
              <p className="mt-3 text-base font-semibold leading-7 text-[var(--brand-dark)]">
                {t("finding", { name: displayName })}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {t("explanation")}
              </p>

              <div className="mt-5 border-t border-[var(--border)] pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
                {t("resolutionLabel")}
                </p>
                <h2 className="mt-3 text-base font-semibold leading-7 text-[var(--brand-dark)]">
                  {t("resolutionTitle", { name: shortName })}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {t("resolutionText", { name: shortName })}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:items-start">
                  <LocalizedLink
                    href={purchaseHref}
                    className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:w-auto sm:whitespace-nowrap"
                  >
                    {t("cta", { name: shortName, price: getTierPriceLabel("protected") })}
                  </LocalizedLink>
                  <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
                    {t("priceNote")}
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-5">
                  <LocalizedLink
                    href="/impact"
                    className="inline-flex text-sm font-semibold text-[var(--section-label)] transition hover:text-[var(--brand-dark)]"
                  >
                    {t("impactLink")}
                  </LocalizedLink>

                  <LocalizedLink
                    href="/wanted"
                    className="inline-flex text-sm font-semibold text-[var(--section-label)] transition hover:text-[var(--brand-dark)]"
                  >
                    {t("newPosterLink")}
                  </LocalizedLink>
                </div>

              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
              {t("previewLabel", { name: shortName })}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {t("previewText", { name: shortName })}
            </p>
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-3 shadow-sm">
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
