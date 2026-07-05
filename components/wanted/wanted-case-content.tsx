"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CertificatePreview } from "@/components/certificate/certificate-preview";
import { LocalizedLink } from "@/components/ui/localized-link";
import { trackEvent } from "@/components/analytics";
import { getTierPriceLabel } from "@/lib/tiers";
import { ANALYTICS_SOURCES } from "@/lib/analytics-events";
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
  initialBy?: string;
  certificateDate: string;
};

export function WantedCaseContent({
  initialName,
  initialTone,
  initialBy,
  certificateDate,
}: WantedCaseContentProps) {
  const t = useTranslations("wantedCase");
  const wantedT = useTranslations("wanted");
  const locale = useLocale();
  const tone = normalizeTone(initialTone);
  const displayName = normalizeName(initialName, wantedT("defaultName"));
  const shortName = displayName.split(/\s+/)[0] || displayName;
  const accuserName = normalizeName(initialBy, "");
  const ambiguityLevel = AMBIGUITY_LEVEL_BY_TONE[tone];
  const personalized = (initialName ?? "").trim().length > 0;
  const [activeResponse, setActiveResponse] = useState<CaseResponse | null>(null);
  const [defenseShareStatus, setDefenseShareStatus] =
    useState<DefenseShareStatus>("idle");
  const [blameName, setBlameName] = useState("");
  const [submittedBlameName, setSubmittedBlameName] = useState("");
  const settlementRef = useRef<HTMLDivElement | null>(null);
  const responseRef = useRef<HTMLDivElement | null>(null);
  const certPreviewRef = useRef<HTMLElement | null>(null);
  // Must match the poster's formula exactly (nameHash of the name alone) —
  // the visitor arrives from a QR on a poster showing this case number, and
  // the fiction cracks if the two documents disagree.
  const caseNumber = `CASE SHA-${nameHash(displayName)
    .toString()
    .slice(-4)
    .padStart(4, "0")}`;

  const purchaseParams = new URLSearchParams({
    tier: "protected",
    gift: "true",
    from: ANALYTICS_SOURCES.wantedCaseCta,
  });
  // Prefill the certificate name only when the case actually names someone.
  // Anonymous cases fall back to the "Unidentified Human" placeholder for
  // display — that must never end up as a prefilled (and silently purchasable)
  // certificate name on /purchase.
  if (personalized) purchaseParams.set("name", displayName);
  const purchaseHref = `/purchase?${purchaseParams.toString()}`;
  // Same guard for the accuse-back trail: carry `by` only when the case
  // subject is a real name, not the placeholder.
  const accuseBackByQuery = personalized
    ? `&by=${encodeURIComponent(displayName)}`
    : "";

  const defenseShareText = [
    t("defenseStatement.title"),
    "",
    t("defenseStatement.body", { name: displayName }),
    "",
    t("defenseStatement.storyVersion"),
  ].join("\n");

  function selectResponse(response: CaseResponse) {
    setActiveResponse(response);
    setDefenseShareStatus("idle");
    trackEvent("wanted_case_response", {
      source: ANALYTICS_SOURCES.wantedCase,
      response,
      tone,
      locale,
      personalized,
    });
  }

  // Header reciprocity shortcut when no specific accuser is on file: open the
  // blame panel and scroll the response block into view so the loop can start
  // without hunting for the right tab.
  function startBlameFromHeader() {
    trackEvent("wanted_accuse_back", {
      tone,
      locale,
      personalized,
      source: ANALYTICS_SOURCES.header,
    });
    selectResponse("blame");
    scrollToResponseBlock();
  }

  function scrollToResponseBlock() {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    responseRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  // Mobile-only helper: the certificate preview lives in the sidebar, which
  // stacks below the whole main column on small screens — the settle panel
  // references it, so give readers a one-tap way to see it.
  function scrollToCertificatePreview() {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    certPreviewRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
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
      source: ANALYTICS_SOURCES.wantedCase,
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
      source: ANALYTICS_SOURCES.wantedCase,
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

  const caseStatusContent = (
    <div className="grid gap-4 sm:grid-cols-2">
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
            {t("caseStatusBlock.humanCooperationLabel")}
          </p>
          <p className="mt-1 font-mono text-xs font-semibold text-[var(--brand-dark)]">
            {t("caseStatusBlock.humanCooperation")}
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
        {/* Tone meta fields relocated from the header card — same
            administrative-metadata genre as the rest of the dossier. */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {wantedT("filedBecauseLabel")}
          </p>
          <p className="mt-1 font-mono text-xs font-semibold text-[var(--brand-dark)]">
            {wantedT(`tones.${tone}.filedBecause`)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {wantedT("remedyLabel")}
          </p>
          <p className="mt-1 font-mono text-xs font-semibold text-[var(--brand-dark)]">
            {wantedT(`tones.${tone}.remedy`)}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface-soft)]/55 py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:items-start xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.7fr)]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
              {t("eyebrow")}
            </p>

            <div className="mt-5 min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[#f6ecd8] p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {t("caseFileLabel")}
                </p>
                <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1.5">
                  {/* Bureau mood stays above the fold as the one tone-specific
                      flavor chip; the other tone meta fields live in the
                      collapsed dossier below. */}
                  <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-[var(--accent)]/40 bg-white/60 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--brand-dark)]">
                    {wantedT("bureauMoodLabel")}:{" "}
                    <span className="truncate">
                      {wantedT(`tones.${tone}.bureauMood`)}
                    </span>
                  </span>
                  <p className="min-w-0 truncate font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                    {caseNumber}
                  </p>
                </div>
              </div>

              <h1 className="mt-5 max-w-2xl text-pretty text-2xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-3xl sm:leading-[1.09]">
                {t("headline")}
              </h1>

              <p className="mt-4 break-words text-4xl font-black leading-none tracking-tight text-[var(--brand-dark)] sm:text-5xl">
                {displayName}
              </p>

              {accuserName ? (
                <p className="mt-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {t("filedByLabel", { name: accuserName })}
                </p>
              ) : null}

              <p className="mt-4 w-full border-l-4 border-[var(--accent)] bg-white/45 py-3 pl-4 pr-3 text-base font-semibold leading-7 text-[var(--brand-dark)]">
                {t("caseTagline", { name: shortName })}
              </p>

              {/* Trust line in the first viewport: a cold QR visitor must
                  learn within seconds that the joke is a joke and the
                  conservation part is not. Styled as a filed margin note. */}
              <p className="mt-3 inline-block rounded-md border border-dashed border-[var(--muted)]/50 bg-white/55 px-3 py-1.5 font-mono text-xs font-semibold text-[var(--muted)]">
                {t("explanation")}
              </p>

              <div className="mt-5 rounded-2xl border border-[var(--accent)]/45 bg-white/75 p-4 shadow-sm sm:p-5">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,auto)] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <p className="max-w-[16rem] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
                        {t("caseStatusBlock.ambiguityLabel")}
                      </p>
                      <p className="shrink-0 font-mono text-xl font-bold leading-none text-[var(--brand-dark)] sm:text-2xl">
                        {t("caseStatusBlock.ambiguityValue", {
                          level: ambiguityLevel,
                        })}
                      </p>
                    </div>
                    <div
                      className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full bg-[var(--accent)]"
                        style={{ width: `${ambiguityLevel}%` }}
                      />
                    </div>
                    <div className="mt-3 rounded-xl border border-[var(--border)] bg-white/70 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        {t("caseStatusBlock.ambiguityMethodLabel")}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-5 text-[var(--brand-dark)]">
                        {t("caseStatusBlock.ambiguityMethod")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 lg:min-w-[230px]">
                  <LocalizedLink
                    href={purchaseHref}
                    onClick={() =>
                      trackEvent("wanted_to_purchase_click", {
                        source: ANALYTICS_SOURCES.wantedCaseCta,
                        placement: "case_header",
                        tone,
                        locale,
                        personalized,
                      })
                    }
                    className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:w-auto"
                  >
                    {t("settleShortcutCta", {
                      price: getTierPriceLabel("protected"),
                    })}
                  </LocalizedLink>
                  <button
                    type="button"
                    onClick={scrollToResponseBlock}
                    className="inline-flex min-h-[40px] items-center justify-center text-sm font-semibold text-[var(--section-label)] transition hover:text-[var(--brand-dark)]"
                  >
                    {t("settleShortcutSecondary")}
                  </button>
                  </div>
                </div>
              </div>

              {accuserName ? (
                <LocalizedLink
                  href={`/wanted?name=${encodeURIComponent(accuserName)}${accuseBackByQuery}`}
                  onClick={() =>
                    trackEvent("wanted_accuse_back", {
                      tone,
                      locale,
                      personalized,
                      source: ANALYTICS_SOURCES.header,
                    })
                  }
                  className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-red-300 bg-red-50/60 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors duration-300 ease-out hover:bg-red-50"
                >
                  {t("accuseBackShortcut", { name: accuserName })}
                </LocalizedLink>
              ) : (
                <button
                  type="button"
                  onClick={startBlameFromHeader}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-red-300 bg-red-50/60 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors duration-300 ease-out hover:bg-red-50"
                >
                  {t("accuseBackGeneric")}
                </button>
              )}


            </div>

            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
                {t("findingLabel")}
              </p>
              <p className="mt-3 whitespace-pre-line text-base font-semibold leading-7 text-[var(--brand-dark)]">
                {t("finding", { name: displayName })}
              </p>

              <div ref={responseRef} className="mt-5 border-t border-[var(--border)] pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
                  {t("response.label")}
                </p>
                <h2 className="mt-3 text-base font-semibold leading-7 text-[var(--brand-dark)]">
                  {t("response.title")}
                </h2>

                {/* Hierarchy: settle (purchase) and blame (viral loop) are the
                    two high-value paths and lead visually; deny is a dead-end so
                    it sits below as a slim, muted secondary action. */}
                <div className="mt-4 space-y-2 sm:space-y-3">
                  <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => selectResponse("settle")}
                      aria-pressed={activeResponse === "settle"}
                      className={`min-h-[96px] rounded-xl border p-4 text-left transition-colors duration-300 ease-out lg:min-h-[120px] lg:p-5 ${
                        activeResponse === "settle"
                          ? "border-[var(--accent)] bg-[var(--surface-soft)] text-[var(--brand-dark)] shadow-sm ring-1 ring-[var(--accent)]/30"
                          : "border-[var(--accent)]/45 bg-[var(--surface-soft)]/60 text-[var(--brand-dark)] hover:bg-[var(--surface-soft)]"
                      }`}
                    >
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
                        {t("response.settleTag")}
                      </span>
                      <span className="mt-1.5 block text-sm font-semibold text-[var(--brand-dark)]">
                        {t("response.settleTitle")}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-[var(--muted)] sm:leading-6">
                        {t("response.settleText")}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectResponse("blame")}
                      aria-pressed={activeResponse === "blame"}
                      className={`min-h-[96px] rounded-xl border p-4 text-left transition-colors duration-300 ease-out lg:min-h-[120px] lg:p-5 ${
                        activeResponse === "blame"
                          ? "border-red-500 bg-red-50 text-red-900 shadow-sm ring-1 ring-red-300"
                          : "border-red-300 bg-red-50/50 text-red-800 hover:bg-red-50"
                      }`}
                    >
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-red-700">
                        {t("response.blameTag")}
                      </span>
                      <span className="mt-1.5 block text-sm font-semibold text-red-900">
                        {t("response.blameTitle")}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-red-800/80 sm:leading-6">
                        {t("response.blameText")}
                      </span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => selectResponse("deny")}
                    aria-pressed={activeResponse === "deny"}
                    className={`flex min-h-[52px] w-full flex-col gap-0.5 rounded-lg border px-4 py-2.5 text-left transition-colors duration-300 ease-out sm:flex-row sm:items-center sm:gap-2 ${
                      activeResponse === "deny"
                        ? "border-[var(--accent)] bg-[var(--surface-soft)] text-[var(--brand-dark)]"
                        : "border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--surface-soft)]"
                    }`}
                  >
                    <span className="text-sm font-semibold text-[var(--brand-dark)]">
                      {t("response.denyTitle")}
                    </span>
                    <span className="text-sm leading-5 text-[var(--muted)]">
                      {t("response.denyText")}
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

                    {/* Denial is the fun dead-end — bridge it back into the
                        conversion path so the loop never just stops. */}
                    <div className="mt-5 border-t border-dashed border-[var(--border)] pt-4">
                      <p className="text-sm leading-6 text-[var(--muted)]">
                        {t("defenseStatement.bridgeText")}
                      </p>
                      <button
                        type="button"
                        onClick={() => selectResponse("settle")}
                        className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)]"
                      >
                        {t("defenseStatement.bridgeCta", {
                          price: getTierPriceLabel("protected"),
                        })}
                      </button>
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
                          {t("blamePanel.resultTitle")}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          {t("blamePanel.resultText")}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-[var(--brand-dark)]">
                          <span className="font-semibold">
                            {t("blamePanel.targetLabel")}:
                          </span>{" "}
                          {submittedBlameName}
                        </p>
                        <p className="mt-3 font-mono text-sm font-semibold uppercase tracking-[0.08em] text-[var(--brand-dark)]">
                          <span className="font-semibold">
                            {t("blamePanel.updatedStatusLabel")}:
                          </span>{" "}
                          {t("blamePanel.updatedStatusValue")}
                        </p>
                        <div className="mt-4 rounded-lg border border-[var(--border)] bg-white px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
                            {t("blamePanel.noteTitle")}
                          </p>
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--brand-dark)]">
                            {t("blamePanel.noteText")}
                          </p>
                        </div>
                        <p className="mt-4 whitespace-pre-line text-sm font-semibold leading-6 text-[var(--brand-dark)]">
                          {t("blamePanel.storyVersion")}
                        </p>

                        <div className="mt-5 border-t border-dashed border-[var(--border)] pt-4">
                          <LocalizedLink
                            href={`/wanted?name=${encodeURIComponent(submittedBlameName)}${accuseBackByQuery}`}
                            onClick={() =>
                              trackEvent("wanted_accuse_back", {
                                tone,
                                locale,
                                personalized,
                                source: ANALYTICS_SOURCES.wantedCase,
                              })
                            }
                            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-red-700 sm:w-auto"
                          >
                            {t("blamePanel.issuePosterCta", {
                              name: submittedBlameName,
                            })}
                          </LocalizedLink>
                          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                            {t("blamePanel.issuePosterHint")}
                          </p>
                        </div>
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

                  <button
                    type="button"
                    onClick={scrollToCertificatePreview}
                    className="mt-3 inline-flex min-h-[40px] items-center text-sm font-semibold text-[var(--section-label)] transition hover:text-[var(--brand-dark)] lg:hidden"
                  >
                    {t("resolutionPreviewLink")}
                  </button>

                  <div className="mt-6 flex flex-col gap-3 sm:items-start">
                    <LocalizedLink
                      href={purchaseHref}
                      onClick={() =>
                        trackEvent("wanted_to_purchase_click", {
                          source: ANALYTICS_SOURCES.wantedCaseCta,
                          placement: "case_response",
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

            <details className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)] bg-white/80 shadow-sm">
              <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)] transition hover:bg-[var(--surface-soft)] sm:px-6">
                <span>{t("fullCaseFileSummary")}</span>
                <span aria-hidden="true">+</span>
              </summary>
              <div className="border-t border-[var(--border)] bg-[#f6ecd8]/45 px-5 py-5 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {t("caseStatusBlock.title")}
                </p>
                <div className="mt-4">
                  {caseStatusContent}
                </div>
              </div>
            </details>
          </div>

          <aside
            ref={certPreviewRef}
            className="mx-auto min-w-0 w-full max-w-md scroll-mt-24 lg:sticky lg:top-28 lg:mx-0 lg:ml-auto lg:max-h-[calc(100vh-8rem)] lg:max-w-[360px] lg:overflow-y-auto lg:overscroll-contain lg:pr-2 xl:max-w-[390px]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
              {t("previewLabel", { name: shortName })}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {t("previewText", { name: shortName })}
            </p>
            <div className="mt-4 min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-3 shadow-sm">
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
