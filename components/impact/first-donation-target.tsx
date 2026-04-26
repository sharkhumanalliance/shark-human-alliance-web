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
      <aside className="rounded-2xl border border-teal-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700">
              {t("firstTargetLabel")}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--brand-dark)]">
              {t("firstTargetTitle")}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {t("firstTargetStatus")}
            </p>
          </div>
          <div className="w-full shrink-0 sm:w-56">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold text-teal-900">
              <span>{t("firstTargetCurrent")}</span>
              <span>{t("firstTargetGoal")}</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-teal-50">
              <div
                className="h-full rounded-full bg-teal-500"
                style={{ width: `${FIRST_DONATION_PROGRESS}%` }}
              />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="overflow-hidden rounded-[28px] border border-teal-200 bg-white">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)]">
        <div className="px-5 py-5 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700">
            {t("firstTargetLabel")}
          </p>
          <h3 className="mt-3 text-xl font-semibold text-[var(--brand-dark)] sm:text-2xl">
            {t("firstTargetTitle")}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            {t("firstTargetText")}
          </p>
        </div>

        <div className="border-t border-teal-100 bg-teal-50/40 px-5 py-5 sm:px-6 lg:border-l lg:border-t-0">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800/80">
                {t("firstTargetProgressLabel")}
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-teal-800">
                {t("firstTargetCurrent")}
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-teal-900">
              {t("firstTargetGoal")}
            </p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-teal-500"
              style={{ width: `${FIRST_DONATION_PROGRESS}%` }}
            />
          </div>
          <p className="mt-3 text-xs font-medium leading-5 text-teal-900/75">
            {t("firstTargetStatus")}
          </p>
        </div>
      </div>
    </aside>
  );
}
