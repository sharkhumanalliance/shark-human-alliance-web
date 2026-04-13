"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const REVEAL_SELECTOR = "main [data-reveal]";

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));

    if (!elements.length) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      elements.forEach((element) => {
        element.classList.remove("reveal-pending");
        element.classList.add("is-visible");
      });
      return;
    }

    const viewportThreshold = window.innerHeight * 0.9;

    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();

      if (rect.top <= viewportThreshold) {
        element.classList.add("is-visible");
        element.classList.remove("reveal-pending");
      } else {
        element.classList.add("reveal-pending");
        element.classList.remove("is-visible");
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.remove("reveal-pending");
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    elements.forEach((element) => {
      if (!element.classList.contains("is-visible")) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
