"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CertificatePreview } from "@/components/certificate/certificate-preview";
import { LocalizedLink } from "@/components/ui/localized-link";
import { trackEvent } from "@/components/analytics";
import { getTierPriceLabel } from "@/lib/tiers";
import { useLocale, useTranslations } from "next-intl";

type WantedCaseTone = "mild" | "clear" | "emergency";
type CaseResponse = "deny" | "blame" | "settle";
type DefenseShareStatus = "idle" | "copied" | "error";

const WANTED_CASE_TONES: WantedCaseTone[] = ["mild", "clear", "emergency"];
const BUREAU_NOTE_INDEXES = [0, 1, 2] as const;
const SETTLED_OUTCOME_KEYS = ["ambiguity", "status", "luna", "finnley"] as const;
const BUREAU_NOTE_SOURCES = [
  "https://www.floridamuseum.ufl.edu/shark-attacks/yearly-worldwide-summary/",
  "https://www.floridamuseum.ufl.edu/discover-fish/sharks/shark-attack-faq/",
  "https://www.sciencedirect.com/science/article/abs/pii/S0308597X13000055",
] as const;
const AMBIGUITY_LEVEL_BY_TONE: Record<WantedCaseTone, number> = {
  mild: 42,
  clear: 73,
  emergency: 87,
};

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
  const ambiguityLevel = AMBIGUITY_LEVEL_BY_TONE[tone];
  const personalized = (initialName ?? "").trim().length > 0;
  const [activeResponse, setActiveResponse] = useState<CaseResponse | null>(null);
  const [defenseShareStatus, setDefenseShareStatus] =
    useState<DefenseShareStatus>("idle");
  const [blameName, setBlameName] = useState("");
  const [submittedBlameName, setSubmittedBlameName] = useState("");
  const settlementRef = useRef<HTMLDivElement | null>(null);
  const caseNumber = `CASE SHA-${nameHash(`${displayName}:${tone}`)
    .toString()
    .slice(-4)
    .padStart(4, "0")}`;

  const purchaseParams = new URLSearchParams({
    tier: "protected",
    gift: "true",
    from: "wanted_poster",
    name: displayName,
  });
  const purchaseHref = `/purchase?${purchaseParams.toString()}`;

  const defenseShareText = [
    t("defenseStatement.title"),
    "",
    t("defenseStatement.body", { name: displayName }),
    "",
    t("defenseStatement.reviewLabel"),
    t("defenseStatement.reviewCredibility"),
    t("defenseStatement.reviewPaperwork"),
    t("defenseStatement.reviewAmbiguity"),
    t("defenseStatement.reviewLuna"),
    "",
    t("defenseStatement.storyVersion"),
  ].join("\n");

  function selectResponse(response: CaseResponse) {
    setActiveResponse(response);
    setDefenseShareStatus("idle");
    trackEvent("wanted_case_response", {
      response,
      tone,
      locale,
      personalized,
    });
  }

  async function handleShareDefense() {
    setDefenseShareStatus("idle");

    try {
      if (navigator.share) {
        await navigator.share({
          title: t("defenseStatement.shareTitle", { name: displayName }),
          text: defenseShareText,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(defenseShareText);
        setDefenseShareStatus("copied");
        return;
      }

      setDefenseShareStatus("error");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setDefenseShareStatus("error");
    }
  }

  function handleBlameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedBlameName = normalizeName(blameName, "");
    if (!normalizedBlameName) return;

    setSubmittedBlameName(normalizedBlameName);
    trackEvent("wanted_case_blame_submitted", {
      tone,
      locale,
      personalized,
    });
  }

  const viewedRef = useRef(false);
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    trackEvent("wanted_case_view", {
      tone,
      locale,
      personalized,
    });
  }, [tone, locale, personalized]);

  useEffect(() => {
    if (activeResponse !== "settle") return;
    const settlementSection = settlementRef.current;
    if (!settlementSection) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    settlementSection.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [activeResponse]);

  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface-soft)]/55 py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:items-start xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.7fr)]">
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

              <div className="mt-6 border-t border-[var(--muted)]/35 pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {t("caseStatusBlock.title")}
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      {t("caseStatusBlock.officerLabel")}
                    </p>
                    <p className="mt-1 font-semibold text-[var(--brand-dark)]">
                      {t("caseStatusBlock.officerName")}
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--muted)]">
                      {t("caseStatusBlock.officerRole")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      {t("caseStatusBlock.supervisorLabel")}
                    </p>
                    <p className="mt-1 font-semibold text-[var(--brand-dark)]">
                      {t("caseStatusBlock.supervisorName")}
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--muted)]">
                      {t("caseStatusBlock.supervisorRole")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      {t("caseStatusBlock.moodLabel")}
                    </p>
                    <p className="mt-1 font-mono text-sm font-semibold text-[var(--brand-dark)]">
                      {t("caseStatusBlock.moodValue")}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        {t("caseStatusBlock.ambiguityLabel")}
                      </p>
                      <p className="font-mono text-sm font-bold text-[var(--brand-dark)]">
                        {t("caseStatusBlock.ambiguityValue", {
                          level: ambiguityLevel,
                        })}
                      </p>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/70">
                      <div
                        className="h-full rounded-full bg-[var(--accent)]"
                        style={{ width: `${ambiguityLevel}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--brand-dark)]">
                      <span className="font-semibold">
                        {t("caseStatusBlock.ambiguityReasonLabel")}:
                      </span>{" "}
                      {t("caseStatusBlock.ambiguityReason")}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      <span className="font-semibold">
                        {t("caseStatusBlock.ambiguityMethodLabel")}:
                      </span>{" "}
                      {t("caseStatusBlock.ambiguityMethod")}
                    </p>
                  </div>
                  <div className="grid gap-3 border-t border-dashed border-[var(--muted)]/40 pt-4 sm:col-span-2 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        {t("caseStatusBlock.fileLocationLabel")}
                      </p>
                      <p className="mt-1 font-mono text-xs font-semibold text-[var(--brand-dark)]">
                        {t("caseStatusBlock.fileLocation")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        {t("caseStatusBlock.stampStatusLabel")}
                      </p>
                      <p className="mt-1 font-mono text-xs font-semibold text-[var(--brand-dark)]">
                        {t("caseStatusBlock.stampStatus")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
                {t("findingLabel")}
              </p>
              <p className="mt-3 whitespace-pre-line text-base font-semibold leading-7 text-[var(--brand-dark)]">
                {t("finding", { name: displayName })}
              </p>
              <p className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)]/70 px-3 py-2 text-sm font-medium leading-6 text-[var(--brand-dark)]">
                {t("explanation")}
              </p>

              <div className="mt-5 border-t border-[var(--border)] pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
                  {t("response.label")}
                </p>
                <h2 className="mt-3 text-base font-semibold leading-7 text-[var(--brand-dark)]">
                  {t("response.title")}
                </h2>

                <div className="mt-4 grid gap-2 sm:gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => selectResponse("deny")}
                    aria-pressed={activeResponse === "deny"}
                    className={`min-h-[84px] rounded-xl border p-4 text-left transition-colors duration-300 ease-out sm:min-h-[96px] lg:min-h-[112px] lg:p-5 ${
                      activeResponse === "deny"
                        ? "border-[var(--accent)] bg-[var(--surface-soft)] text-[var(--brand-dark)] shadow-sm"
                        : "border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--surface-soft)]"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-[var(--brand-dark)]">
                      {t("response.denyTitle")}
                    </span>
                    <span className="mt-1 block text-sm leading-5 sm:mt-2 sm:leading-6">
                      {t("response.denyText")}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectResponse("blame")}
                    aria-pressed={activeResponse === "blame"}
                    className={`min-h-[84px] rounded-xl border p-4 text-left transition-colors duration-300 ease-out sm:min-h-[96px] lg:min-h-[112px] lg:p-5 ${
                      activeResponse === "blame"
                        ? "border-[var(--accent)] bg-[var(--surface-soft)] text-[var(--brand-dark)] shadow-sm"
                        : "border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--surface-soft)]"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-[var(--brand-dark)]">
                      {t("response.blameTitle")}
                    </span>
                    <span className="mt-1 block text-sm leading-5 sm:mt-2 sm:leading-6">
                      {t("response.blameText")}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectResponse("settle")}
                    aria-pressed={activeResponse === "settle"}
                    className={`min-h-[84px] rounded-xl border p-4 text-left transition-colors duration-300 ease-out sm:min-h-[96px] lg:min-h-[112px] lg:p-5 ${
                      activeResponse === "settle"
                        ? "border-[var(--accent)] bg-[var(--surface-soft)] text-[var(--brand-dark)] shadow-sm"
                        : "border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--surface-soft)]"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-[var(--brand-dark)]">
                      {t("response.settleTitle")}
                    </span>
                    <span className="mt-1 block text-sm leading-5 sm:mt-2 sm:leading-6">
                      {t("response.settleText")}
                    </span>
                  </button>
                </div>

                {activeResponse === "deny" ? (
                  <div className="mt-5 border-t border-dashed border-[var(--border)] pt-5">
                    <p className="font-semibold text-[var(--brand-dark)]">
                      {t("defenseStatement.statusTitle")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {t("defenseStatement.statusText")}
                    </p>
                    <p className="mt-3 font-mono text-sm font-semibold uppercase tracking-[0.08em] text-[var(--brand-dark)]">
                      {t("defenseStatement.updatedStatusLabel")}:{" "}
                      {t("defenseStatement.updatedStatusValue")}
                    </p>

                    <div className="mt-5 rounded-xl border border-[var(--border)] border-l-4 border-l-[var(--accent)] bg-[#fbf7ef] px-5 py-5 shadow-inner">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
                        {t("defenseStatement.title")}
                      </p>
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--brand-dark)]">
                        {t("defenseStatement.body", { name: displayName })}
                      </p>
                      <div className="mt-4 border-t border-[var(--border)] pt-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
                          {t("defenseStatement.reviewLabel")}
                        </p>
                        <div className="mt-2 space-y-1 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                          <p>{t("defenseStatement.reviewCredibility")}</p>
                          <p>{t("defenseStatement.reviewPaperwork")}</p>
                          <p>{t("defenseStatement.reviewAmbiguity")}</p>
                          <p>{t("defenseStatement.reviewLuna")}</p>
                        </div>
                      </div>
                      <div className="mt-4 border-t border-[var(--border)] pt-4">
                        <p className="whitespace-pre-line text-sm font-semibold leading-6 text-[var(--brand-dark)]">
                          {t("defenseStatement.storyVersion")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={handleShareDefense}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-dark)] transition hover:bg-[var(--surface-soft)]"
                      >
                        {t("defenseStatement.shareButton")}
                      </button>
                      {defenseShareStatus !== "idle" ? (
                        <p
                          className={`text-sm font-medium ${
                            defenseShareStatus === "copied"
                              ? "text-teal-700"
                              : "text-red-700"
                          }`}
                          role="status"
                        >
                          {defenseShareStatus === "copied"
                            ? t("defenseStatement.copied")
                            : t("defenseStatement.error")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {activeResponse === "blame" ? (
                  <div className="mt-5 border-t border-dashed border-[var(--border)] pt-5">
                    <p className="font-semibold text-[var(--brand-dark)]">
                      {t("blamePanel.title")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {t("blamePanel.text")}
                    </p>
                    <form
                      className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                      onSubmit={handleBlameSubmit}
                    >
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[var(--brand-dark)]">
                          {t("blamePanel.inputLabel")}
                        </span>
                        <input
                          value={blameName}
                          onChange={(event) => {
                            setBlameName(event.target.value);
                            setSubmittedBlameName("");
                          }}
                          placeholder={t("blamePanel.inputPlaceholder")}
                          className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--brand-dark)] shadow-sm placeholder:text-[var(--muted)]/50 transition focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15"
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={!blameName.trim()}
                        className="min-h-[48px] self-end rounded-lg bg-[var(--brand-dark)] px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {t("blamePanel.button")}
                      </button>
                    </form>

                    {submittedBlameName ? (
                      <div className="mt-4 border-l-4 border-[var(--brand-dark)] bg-[var(--surface-soft)]/60 py-4 pl-4 pr-3">
                        <p className="font-semibold text-[var(--brand-dark)]">
                          {t("blamePanel.confirmationTitle")}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          {t("blamePanel.confirmationText")}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-[var(--brand-dark)]">
                          <span className="font-semibold">
                            {t("blamePanel.lunaNoteLabel")}:
                          </span>{" "}
                          {t("blamePanel.lunaNote", {
                            name: submittedBlameName,
                          })}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[var(--brand-dark)]">
                          {t("blamePanel.finnleyNote")}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {activeResponse === "settle" ? (
                <div
                  ref={settlementRef}
                  className="mt-5 border-t border-dashed border-[var(--border)] pt-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
                    {t("resolutionLabel")}
                  </p>
                  <h2 className="mt-3 text-base font-semibold leading-7 text-[var(--brand-dark)]">
                    {t("resolutionTitle")}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {t("resolutionText")}
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {SETTLED_OUTCOME_KEYS.map((outcome) => (
                      <p
                        key={outcome}
                        className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)]/60 px-3 py-2 font-mono text-xs font-semibold uppercase tracking-[0.06em] text-[var(--brand-dark)]"
                      >
                        {t(`settledOutcomes.${outcome}`)}
                      </p>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:items-start">
                    <LocalizedLink
                      href={purchaseHref}
                      onClick={() =>
                        trackEvent("wanted_to_purchase_click", {
                          source: "wanted_case_cta",
                          tone,
                          locale,
                          personalized,
                        })
                      }
                      className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:w-auto sm:whitespace-nowrap"
                    >
                      {t("cta", { price: getTierPriceLabel("protected") })}
                    </LocalizedLink>
                    <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
                      {t("priceNote")}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <LocalizedLink
                      href="/impact"
                      className="inline-flex min-h-[44px] items-center text-sm font-semibold text-[var(--section-label)] transition hover:text-[var(--brand-dark)]"
                    >
                      {t("impactLink")}
                    </LocalizedLink>

                    <LocalizedLink
                      href="/wanted"
                      className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-dark)] transition hover:bg-[var(--surface-soft)] sm:ml-auto"
                    >
                      {t("newPosterLink")}
                    </LocalizedLink>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="mx-auto w-full max-w-md lg:sticky lg:top-28 lg:mx-0 lg:ml-auto lg:max-h-[calc(100vh-8rem)] lg:max-w-[360px] lg:overflow-y-auto lg:overscroll-contain lg:pr-2 xl:max-w-[390px]">
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

        <div className="mt-10 border-t border-[var(--border)] pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
            {t("bureauNotes.label")}
          </p>
          <div className="mt-3 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("bureauNotes.title")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {t("bureauNotes.intro")}
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {BUREAU_NOTE_INDEXES.map((noteIndex) => (
              <article
                key={noteIndex}
                className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm"
              >
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--section-label)]">
                  {t(`bureauNotes.items.${noteIndex}.code`)}
                </p>
                <h3 className="mt-3 text-base font-semibold leading-6 text-[var(--brand-dark)]">
                  {t(`bureauNotes.items.${noteIndex}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {t(`bureauNotes.items.${noteIndex}.text`)}
                </p>
                <a
                  href={BUREAU_NOTE_SOURCES[noteIndex]}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-sm font-semibold text-[var(--section-label)] transition hover:text-[var(--brand-dark)]"
                >
                  {t("bureauNotes.sourceLabel")}{" "}
                  <span aria-hidden="true">→</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
