"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type CertificateAccessPanelProps = {
  token: string;
  initialRegistryVisibility: "public" | "private";
};

export function CertificateAccessPanel({
  token,
  initialRegistryVisibility,
}: CertificateAccessPanelProps) {
  const t = useTranslations("certificateAccess");
  const [registryVisibility, setRegistryVisibility] = useState(initialRegistryVisibility);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [erased, setErased] = useState(false);

  async function runAction(action: "hide" | "erase") {
    if (action === "erase" && !window.confirm(t("eraseConfirm"))) {
      return;
    }

    setSubmitting(true);
    setStatus("");

    try {
      const response = await fetch("/api/member-privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "request_failed");
      }

      if (action === "hide") {
        setRegistryVisibility("private");
        setStatus(t("hideSuccess"));
      } else {
        setRegistryVisibility("private");
        setErased(true);
        setStatus(t("eraseSuccess"));
      }
    } catch {
      setStatus(t("actionError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="record-controls"
      className="mx-auto mt-8 max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm print:hidden sm:p-6"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
        {t("eyebrow")}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-[var(--brand-dark)]">
        {t("title")}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {t("description")}
      </p>

      <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          {t("visibilityLabel")}
        </p>
        <p className="mt-2 text-sm font-semibold text-[var(--brand-dark)]">
          {registryVisibility === "public" ? t("visibilityPublic") : t("visibilityPrivate")}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={submitting || erased || registryVisibility === "private"}
          onClick={() => runAction("hide")}
          className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("hideButton")}
        </button>
        <button
          type="button"
          disabled={submitting || erased}
          onClick={() => runAction("erase")}
          className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("eraseButton")}
        </button>
      </div>

      <p aria-live="polite" className="mt-4 min-h-5 text-sm text-[var(--muted)]">
        {status}
      </p>
    </section>
  );
}
