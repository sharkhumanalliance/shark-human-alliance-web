"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

const locales = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(nextLocale: string) {
    // Replace the current locale prefix in the pathname
    // pathname is like /en/membership or /es/membership
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    const newPath = segments.join("/");

    startTransition(() => {
      router.replace(newPath);
    });
  }

  return (
    <div className="flex items-center gap-1">
      {locales.map((loc) => (
        <button
          key={loc.code}
          onClick={() => switchLocale(loc.code)}
          disabled={isPending}
          title={loc.label}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition ${
            locale === loc.code
              ? "bg-sky-100 shadow-sm"
              : "opacity-50 hover:opacity-100 hover:bg-sky-50"
          } ${isPending ? "cursor-wait" : "cursor-pointer"}`}
        >
          {loc.flag}
        </button>
      ))}
    </div>
  );
}
