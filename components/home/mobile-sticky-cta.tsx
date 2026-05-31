"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/components/analytics";
import { LocalizedLink } from "@/components/ui/localized-link";

const DISMISS_KEY = "sha_home_sticky_cta_dismissed";
const DESKTOP_QUERY = "(min-width: 1024px)";

function readDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function writeDismissed() {
  try {
    sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // Ignore storage failures; the close button should still hide the bar now.
  }
}

export function MobileStickyCta() {
  const t = useTranslations("stickyCta");
  const [show, setShow] = useState(false);
  const dismissedRef = useRef(false);
  const shownTrackedRef = useRef(false);

  useEffect(() => {
    dismissedRef.current = readDismissed();

    const mediaQuery = window.matchMedia(DESKTOP_QUERY);
    let heroOut = false;
    let blockerIn = false;
    let heroObserver: IntersectionObserver | null = null;
    let blockerObserver: IntersectionObserver | null = null;
    const blockerStates = new Map<Element, boolean>();

    const sync = () => {
      const nextShow = heroOut && !blockerIn && !dismissedRef.current;
      setShow(nextShow);

      if (nextShow && !shownTrackedRef.current) {
        shownTrackedRef.current = true;
        trackEvent("sticky_cta_shown", {
          source: "home_mobile_sticky_cta",
        });
      }
    };

    const disconnectObservers = () => {
      heroObserver?.disconnect();
      blockerObserver?.disconnect();
      heroObserver = null;
      blockerObserver = null;
      blockerStates.clear();
    };

    const setupObservers = () => {
      disconnectObservers();
      heroOut = false;
      blockerIn = false;
      setShow(false);

      if (mediaQuery.matches || dismissedRef.current) return;

      const hero = document.getElementById("home-hero");
      if (!hero) return;

      heroObserver = new IntersectionObserver(
        ([entry]) => {
          heroOut = !entry.isIntersecting;
          sync();
        },
        { rootMargin: "-40% 0px 0px 0px" },
      );
      heroObserver.observe(hero);

      const blockers = [
        document.getElementById("home-final-cta"),
        document.getElementById("site-footer"),
      ].filter((element): element is HTMLElement => Boolean(element));

      if (blockers.length > 0) {
        blockerObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              blockerStates.set(entry.target, entry.isIntersecting);
            }
            blockerIn = Array.from(blockerStates.values()).some(Boolean);
            sync();
          },
          { rootMargin: "0px 0px -10% 0px" },
        );
        for (const blocker of blockers) {
          blockerObserver.observe(blocker);
        }
      }
    };

    setupObservers();
    mediaQuery.addEventListener("change", setupObservers);

    return () => {
      mediaQuery.removeEventListener("change", setupObservers);
      disconnectObservers();
    };
  }, []);

  const handleClick = () => {
    trackEvent("sticky_cta_click", {
      source: "home_mobile_sticky_cta",
    });
  };

  const handleDismiss = () => {
    dismissedRef.current = true;
    writeDismissed();
    setShow(false);
    trackEvent("sticky_cta_dismiss", {
      source: "home_mobile_sticky_cta",
    });
  };

  return (
    <aside
      role="region"
      aria-label={t("label")}
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-[90] border-t border-white/15 bg-[var(--brand-dark)]/95 text-white shadow-[0_-18px_48px_rgba(10,30,54,0.24)] backdrop-blur transition duration-300 ease-out motion-reduce:transition-opacity lg:hidden ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex max-w-lg items-center gap-2 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2">
        <p className="min-w-0 flex-1 truncate text-xs font-semibold leading-5 text-white/90">
          {t("text")}
        </p>
        <LocalizedLink
          href="/purchase?tier=protected"
          onClick={handleClick}
          tabIndex={show ? 0 : -1}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)]"
        >
          {t("cta")}
        </LocalizedLink>
        <button
          type="button"
          aria-label={t("dismissLabel")}
          onClick={handleDismiss}
          tabIndex={show ? 0 : -1}
          className="inline-flex min-h-[44px] min-w-[40px] shrink-0 items-center justify-center rounded-lg text-xl leading-none text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </aside>
  );
}
