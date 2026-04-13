"use client";

import { useTranslations } from "next-intl";

const STEPS = [
  { icon: "customize", key: "stepCustomize" },
  { icon: "payment", key: "stepPayment" },
  { icon: "certificate", key: "stepCertificate" },
] as const;

function StepIcon({ type, active, done }: { type: string; active: boolean; done: boolean }) {
  const color = done ? "text-teal-600" : active ? "text-[var(--brand)]" : "text-[var(--muted)]/40";

  if (type === "customize") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className={`h-4 w-4 ${color}`} aria-hidden="true">
        <path d="M10 3v2m0 10v2M3 10h2m10 0h2m-1.5-5.5L14 6m-8 8-1.5 1.5m11-1.5L14 14M4.5 4.5 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  if (type === "payment") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className={`h-4 w-4 ${color}`} aria-hidden="true">
        <rect x="2" y="4.5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 8h16" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.5 12.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // certificate
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`h-4 w-4 ${color}`} aria-hidden="true">
      <path d="M6 2h8a2 2 0 0 1 2 2v14l-6-3-6 3V4a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 7h4M8 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function StepIndicator({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const t = useTranslations("purchase");

  return (
    <div className="mx-auto max-w-md">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isDone = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={step.key} className="flex items-center gap-2">
              {/* Connector line (before steps 2 and 3) */}
              {index > 0 && (
                <div
                  className={`hidden h-px w-6 min-[400px]:block sm:w-10 ${
                    isDone ? "bg-teal-300" : "bg-[var(--border)]"
                  }`}
                />
              )}

              <div className="flex items-center gap-1.5">
                {/* Circle */}
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                    isDone
                      ? "border-teal-300 bg-teal-50 text-teal-600"
                      : isActive
                        ? "border-[var(--brand)] bg-sky-50 text-[var(--brand)]"
                        : "border-[var(--border)] bg-white text-[var(--muted)]/40"
                  }`}
                >
                  {isDone ? (
                    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-teal-600" aria-hidden="true">
                      <path d="M3.5 8.5 6.5 11.5 12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <StepIcon type={step.icon} active={isActive} done={isDone} />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-xs font-semibold ${
                    isDone
                      ? "text-teal-700"
                      : isActive
                        ? "text-[var(--brand-dark)]"
                        : "text-[var(--muted)]/50"
                  }`}
                >
                  {t(step.key)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
