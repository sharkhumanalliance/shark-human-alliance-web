"use client";

import { useTranslations } from "next-intl";

const FIRST_DONATION_PROGRESS = 0;

type FirstDonationTargetProps = {
  compact?: boolean;
};

export function FirstDonationTarget({ compact = false }: FirstDonationTargetProps) {
  const t = useTranslations("impact");

  if (compact) {
    return (
      <aside className="rounded-xl border border-[var(--border)] bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
              {t("firstTargetLabel")}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--brand-dark)]">
              {t("firstTargetTitle")}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {t("firstTargetStatusShort")}
            </p>
          </div>
          <div className="w-full shrink-0 sm:w-56">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[var(--brand-dark)]">
              <span>{t("firstTargetCurrent")}</span>
              <span>{t("firstTargetGoal")}</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-[var(--surface-soft)]">
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${FIRST_DONATION_PROGRESS}%` }}
              />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.72fr)]">
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
            {t("firstTargetLabel")}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[var(--brand-dark)] sm:text-xl">
            {t("firstTargetTitle")}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-5 text-[var(--muted)]">
            {t("firstTargetText")}
          </p>
        </div>

        <div className="border-t border-[var(--border)] bg-[var(--surface-soft)]/70 px-5 py-4 sm:px-6 sm:py-5 lg:border-l lg:border-t-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
            {t("firstTargetProgressLabel")}
          </p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <p className="text-3xl font-bold leading-none tracking-tight text-[var(--brand-dark)] tabular-nums">
              {t("firstTargetCurrent")} <span className="text-xl text-[var(--muted)]/55">/</span>{" "}
              {t("firstTargetGoalAmount")}
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white shadow-inner">
            <div
              className="h-full rounded-full bg-[var(--accent)]"
              style={{ width: `${FIRST_DONATION_PROGRESS}%` }}
            />
          </div>
          <div className="mt-3 rounded-lg border border-[var(--border)] bg-white/80 px-4 py-3">
            <p className="text-sm font-semibold leading-5 text-[var(--brand-dark)]">
              {t("firstTargetStatusShort")}
            </p>
            <p className="mt-1.5 text-xs font-medium leading-5 text-[var(--muted)]">
              {t("firstTargetStatusNote")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
