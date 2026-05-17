"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { LocalizedLink } from "@/components/ui/localized-link";
import { buildLocalizedPath } from "@/lib/navigation";

type VerifyLookupContentProps = {
  reason?: "missing" | "notFound" | "private";
};

export function VerifyLookupContent({
  reason = "missing",
}: VerifyLookupContentProps) {
  const t = useTranslations("verify.lookup");
  const locale = useLocale();
  const router = useRouter();
  const [code, setCode] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim();
    if (!normalized) return;
    router.push(
      buildLocalizedPath(
        locale,
        `/verify?id=${encodeURIComponent(normalized)}`,
      ),
    );
  }

  return (
    <section data-reveal className="mx-auto max-w-2xl px-4 py-16 sm:px-6 md:py-24">
      <div className="rounded-[28px] border border-[var(--border)] bg-white px-5 py-8 text-center shadow-sm sm:px-8 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
          {t(`${reason}.eyebrow`)}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
          {t(`${reason}.title`)}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          {t(`${reason}.text`)}
        </p>

        <form onSubmit={handleSubmit} className="mx-auto mt-7 max-w-xl">
          <label
            htmlFor="verify-code"
            className="block text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
          >
            {t("codeLabel")}
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="verify-code"
              name="registry_code"
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder={t("placeholder")}
              className="min-h-[48px] flex-1 rounded-lg border border-[var(--border)] bg-white px-4 py-3 font-mono text-sm text-[var(--brand-dark)] placeholder:font-sans placeholder:text-[var(--muted)]/55 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
            />
            <button
              type="submit"
              disabled={!code.trim()}
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("button")}
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 text-sm sm:flex-row">
          <LocalizedLink
            href="/registry"
            className="font-semibold text-[var(--brand-dark)] underline-offset-4 hover:underline"
          >
            {t("registryLink")}
          </LocalizedLink>
          <span className="hidden text-[var(--muted)] sm:inline" aria-hidden="true">
            {"\u00B7"}
          </span>
          <LocalizedLink
            href="/purchase?tier=protected"
            className="font-semibold text-[var(--brand-dark)] underline-offset-4 hover:underline"
          >
            {t("purchaseLink")}
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}
