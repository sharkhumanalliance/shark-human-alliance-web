"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { LocalizedLink } from "@/components/ui/localized-link";
import { trackEvent } from "@/components/analytics";
import { buildAbsoluteLocalizedUrl } from "@/lib/navigation";
import type { PublicTierKey } from "@/lib/tiers";

interface PostPurchaseShareProps {
  member: {
    id: string;
    name: string;
    tier: PublicTierKey;
  };
  /**
   * "full"    — original layout with Story preview, headings and Wanted Poster CTAs.
   * "compact" — streamlined growth block used on the redesigned success page
   *             where the Hero already owns the certificate download.
   */
  variant?: "full" | "compact";
}

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

function isAppleTouchDevice() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, initialSize: number, minSize: number) {
  let fontSize = initialSize;
  while (fontSize > minSize) {
    ctx.font = `700 ${fontSize}px Arial, Helvetica, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    fontSize -= 4;
  }
  return fontSize;
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  initialSize: number,
  minSize: number,
  options: {
    weight?: number;
    family?: string;
    fillStyle?: string;
  } = {},
) {
  const fontSize = fitText(ctx, text, maxWidth, initialSize, minSize);
  ctx.font = `${options.weight ?? 700} ${fontSize}px ${options.family ?? "Georgia, 'Times New Roman', serif"}`;
  ctx.fillStyle = options.fillStyle ?? "#102941";
  ctx.textAlign = "center";
  ctx.fillText(text, x, y, maxWidth);
  ctx.textAlign = "left";
}

function drawCertificateCard({
  ctx,
  memberName,
  tierLabel,
  registryId,
}: {
  ctx: CanvasRenderingContext2D;
  memberName: string;
  tierLabel: string;
  registryId: string;
}) {
  const card = { x: 110, y: 120, width: 860, height: 1040 };
  const centerX = card.x + card.width / 2;

  ctx.save();
  ctx.shadowColor = "rgba(16, 41, 65, 0.20)";
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 22;
  drawRoundedRect(ctx, card.x, card.y, card.width, card.height, 20, "#fff8ed");
  ctx.restore();

  ctx.strokeStyle = "#0d2340";
  ctx.lineWidth = 8;
  ctx.strokeRect(card.x + 36, card.y + 36, card.width - 72, card.height - 72);
  ctx.strokeStyle = "#d7b56d";
  ctx.lineWidth = 3;
  ctx.strokeRect(card.x + 58, card.y + 58, card.width - 116, card.height - 116);

  drawCenteredText(ctx, "CERTIFICATE", centerX, card.y + 180, card.width - 180, 76, 52, {
    weight: 800,
  });
  drawCenteredText(ctx, "OF OFFICIAL RECOGNITION", centerX, card.y + 245, card.width - 180, 35, 26, {
    weight: 700,
  });

  ctx.fillStyle = "#64748b";
  ctx.font = "600 24px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Issued by the Shark Human Alliance", centerX, card.y + 330);

  ctx.fillStyle = "#d7b56d";
  ctx.beginPath();
  ctx.arc(centerX, card.y + 385, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#64748b";
  ctx.font = "italic 26px Georgia, 'Times New Roman', serif";
  ctx.fillText("This certifies that", centerX, card.y + 455);

  drawCenteredText(ctx, memberName.toUpperCase(), centerX, card.y + 560, card.width - 190, 62, 34, {
    weight: 800,
  });

  ctx.fillStyle = "#64748b";
  ctx.font = "600 22px Arial, Helvetica, sans-serif";
  ctx.fillText("has been officially recognized as", centerX, card.y + 650);

  drawCenteredText(ctx, tierLabel.toUpperCase(), centerX, card.y + 750, card.width - 160, 66, 38, {
    weight: 900,
  });

  ctx.fillStyle = "#475569";
  ctx.font = "500 24px Arial, Helvetica, sans-serif";
  ctx.fillText("by paperwork that protects sharks more than humans.", centerX, card.y + 820);

  ctx.strokeStyle = "#d7b56d";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(card.x + 150, card.y + 895);
  ctx.lineTo(card.x + 360, card.y + 895);
  ctx.moveTo(card.x + 500, card.y + 895);
  ctx.lineTo(card.x + 710, card.y + 895);
  ctx.stroke();

  ctx.fillStyle = "#102941";
  ctx.font = "700 26px Georgia, 'Times New Roman', serif";
  ctx.fillText("Finnley Mako", card.x + 255, card.y + 940);
  ctx.fillText("Luna Reef", card.x + 605, card.y + 940);

  ctx.fillStyle = "#64748b";
  ctx.font = "700 20px Arial, Helvetica, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(registryId, card.x + 82, card.y + 1002);
}

async function generateStoryBlob({
  memberName,
  tierLabel,
  registryId,
  siteLabel,
  headlineTop,
  headlineBottom,
  footerLine,
}: {
  memberName: string;
  tierLabel: string;
  registryId: string;
  siteLabel: string;
  headlineTop: string;
  headlineBottom: string;
  footerLine: string;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");

  // Background gradient. The hero illustration carries its own SHA branding so we
  // intentionally skip the top "SHA / Shark Human Alliance" pill bar.
  const gradient = ctx.createLinearGradient(0, 0, STORY_WIDTH, STORY_HEIGHT);
  gradient.addColorStop(0, "#e8fbff");
  gradient.addColorStop(0.45, "#d8f2ff");
  gradient.addColorStop(1, "#fff7e9");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  // Hero illustration — object-contain (Math.min) so the whole "Case closed"
  // composition is visible, not cropped.
  drawCertificateCard({
    ctx,
    memberName,
    tierLabel,
    registryId,
  });

  // Single merged identity + verification card. Replaces the previously separate
  // white name card + dark verification card (now redundant because the hero
  // illustration already declares the brand and the moment).
  const cardBox = { x: 60, y: 1240, width: 960, height: 620 };
  const cardPadX = 60;
  drawRoundedRect(
    ctx,
    cardBox.x,
    cardBox.y,
    cardBox.width,
    cardBox.height,
    40,
    "#0d2340"
  );

  // Tier label (small caps, sky-blue accent).
  ctx.fillStyle = "#9dc4e6";
  ctx.font = "700 28px Arial, Helvetica, sans-serif";
  ctx.fillText(tierLabel.toUpperCase(), cardBox.x + cardPadX, cardBox.y + 80);

  // Member name (medium semibold white).
  const nameFontSize = fitText(
    ctx,
    memberName,
    cardBox.width - cardPadX * 2,
    56,
    32
  );
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${nameFontSize}px Arial, Helvetica, sans-serif`;
  ctx.fillText(memberName, cardBox.x + cardPadX, cardBox.y + 150);

  // Tier-specific headline, two lines.
  const topFontSize = fitText(
    ctx,
    headlineTop,
    cardBox.width - cardPadX * 2,
    80,
    44
  );
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${topFontSize}px Arial, Helvetica, sans-serif`;
  ctx.fillText(headlineTop, cardBox.x + cardPadX, cardBox.y + 290);

  const bottomFontSize = fitText(
    ctx,
    headlineBottom,
    cardBox.width - cardPadX * 2,
    80,
    44
  );
  ctx.font = `700 ${bottomFontSize}px Arial, Helvetica, sans-serif`;
  ctx.fillText(headlineBottom, cardBox.x + cardPadX, cardBox.y + 380);

  // Brand-voice slogan (small, low-emphasis white).
  const footerFontSize = fitText(
    ctx,
    footerLine,
    cardBox.width - cardPadX * 2,
    28,
    20
  );
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.font = `600 ${footerFontSize}px Arial, Helvetica, sans-serif`;
  ctx.fillText(footerLine, cardBox.x + cardPadX, cardBox.y + 480);

  // Verification host (uppercase, even lower emphasis).
  const urlFontSize = fitText(
    ctx,
    siteLabel,
    cardBox.width - cardPadX * 2,
    24,
    16
  );
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = `600 ${urlFontSize}px Arial, Helvetica, sans-serif`;
  ctx.fillText(siteLabel, cardBox.x + cardPadX, cardBox.y + 540);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not export story image."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export function PostPurchaseShare({ member, variant = "full" }: PostPurchaseShareProps) {
  const t = useTranslations("purchase.share");
  const locale = useLocale();
  const [isBusy, setIsBusy] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "done" | "error">("idle");
  const [shareHint, setShareHint] = useState<string | null>(null);

  const verificationUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return buildAbsoluteLocalizedUrl(window.location.origin, locale, `/verify?id=${encodeURIComponent(member.id)}`);
  }, [locale, member.id]);

  const tierLabel = useMemo(() => t(`tierLabels.${member.tier}`), [member.tier, t]);
  const shareTitle = useMemo(() => t(`tierCtas.${member.tier}.title`), [member.tier, t]);
  const shareButtonLabel = useMemo(() => t(`tierCtas.${member.tier}.shareButton`), [member.tier, t]);
  const fileName = useMemo(() => `shark-human-alliance-story-${member.id.toLowerCase()}.png`, [member.id]);

  // Pretty-printed host for the Story preview mock-up — the full UUID URL stays in the
  // actually generated Story (Canvas), but the on-screen preview must look clean.
  const previewHost = useMemo(() => {
    if (!verificationUrl) return "sharkhumanalliance.com";
    try {
      return new URL(verificationUrl).host.replace(/^www\./, "");
    } catch {
      return "sharkhumanalliance.com";
    }
  }, [verificationUrl]);

  // Story file is pre-generated as soon as the component mounts so that the
  // tap on Share can call navigator.share() within the same user-gesture tick.
  // iOS Safari otherwise drops the gesture during the ~300ms canvas render and
  // silently refuses the share.
  const storyFileRef = useRef<File | null>(null);
  const [storyFileReady, setStoryFileReady] = useState(false);

  async function buildStoryFile() {
    const blob = await generateStoryBlob({
      memberName: member.name,
      tierLabel,
      registryId: member.id,
      siteLabel: previewHost,
      headlineTop: t(`tierHeadlines.${member.tier}.headlineTop`),
      headlineBottom: t(`tierHeadlines.${member.tier}.headlineBottom`),
      footerLine: t("storyFooterLine"),
    });
    return new File([blob], fileName, { type: "image/png" });
  }

  useEffect(() => {
    let cancelled = false;
    buildStoryFile()
      .then((file) => {
        if (!cancelled) {
          storyFileRef.current = file;
          setStoryFileReady(true);
        }
      })
      .catch((error) => {
        // Pre-fetch failures are non-fatal — share/download can still try
        // again on demand. We just log so we can see in dev tools why.
        console.warn("[SHA] Story prefetch failed:", error);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member.id, member.name, member.tier]);

  async function getStoryFile() {
    return storyFileRef.current ?? (await buildStoryFile());
  }

  async function downloadStory(options?: { preserveBusyState?: boolean }) {
    if (!options?.preserveBusyState) setIsBusy(true);
    setShareHint(null);
    const shouldOpenImage = isAppleTouchDevice();
    const imageWindow = shouldOpenImage
      ? window.open("", "_blank", "noopener,noreferrer")
      : null;
    try {
      const file = await getStoryFile();
      const objectUrl = URL.createObjectURL(file);
      if (shouldOpenImage) {
        if (imageWindow) {
          imageWindow.location.href = objectUrl;
        } else {
          window.location.href = objectUrl;
        }
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        trackEvent("share_story_downloaded", { tier: member.tier, mode: "open-image" });
        setShareHint(t("downloadReadyIos"));
        return;
      }
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = file.name;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
      trackEvent("share_story_downloaded", { tier: member.tier });
      setShareHint(t("downloadReady"));
    } catch (error) {
      console.warn("[SHA] Story download failed:", error);
      setShareHint(t("downloadError"));
      trackEvent("share_story_failed", { tier: member.tier, stage: "download" });
    } finally {
      if (!options?.preserveBusyState) setIsBusy(false);
    }
  }

  async function shareStory() {
    setIsBusy(true);
    setShareHint(null);
    trackEvent("share_story_clicked", { tier: member.tier });
    try {
      // Use the cached file when available so navigator.share() is called
      // synchronously from the user gesture — required by iOS Safari.
      const shareNavigator = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };
      const file = storyFileRef.current;

      if (file && shareNavigator.share && shareNavigator.canShare?.({ files: [file] })) {
        try {
          await shareNavigator.share({
            files: [file],
            title: t(`tierHeadlines.${member.tier}.nativeTitle`),
            text: `${t(`tierHeadlines.${member.tier}.nativeText`)} ${verificationUrl}`,
            url: verificationUrl,
          });
          trackEvent("share_story_native_success", { tier: member.tier, mode: "file" });
          setShareHint(t("nativeSuccess"));
          return;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            setShareHint(null);
            return;
          }
          // Native share with file failed (common on iOS in-app browsers).
          // Fall through to URL-only share, then to download.
          console.warn("[SHA] Native file share failed:", error);
        }
      }

      if (shareNavigator.share) {
        try {
          await shareNavigator.share({
            title: t(`tierHeadlines.${member.tier}.nativeTitle`),
            text: t(`tierHeadlines.${member.tier}.nativeText`),
            url: verificationUrl,
          });
          trackEvent("share_story_native_success", { tier: member.tier, mode: "url" });
          setShareHint(t("nativeFallback"));
          return;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            setShareHint(null);
            return;
          }
          console.warn("[SHA] Native URL share failed:", error);
        }
      }

      await downloadStory({ preserveBusyState: true });
    } catch (error) {
      console.warn("[SHA] Share story failed:", error);
      trackEvent("share_story_failed", { tier: member.tier, stage: "native-share" });
      await downloadStory({ preserveBusyState: true });
    } finally {
      setIsBusy(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopyState("done");
      trackEvent("share_link_copied", { tier: member.tier });
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 2200);
    }
  }

  if (variant === "compact") {
    // Compact growth block used on the redesigned success page. The Hero owns
    // the certificate download, so this section pushes the share loop and the
    // free Wanted case without repeating the main purchase CTA.
    return (
      <section
        data-reveal
        className="mt-6 border-y border-[var(--border)] py-5 sm:py-6"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)] lg:items-stretch">
          <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {t("compactEyebrow")}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-2xl">
            {t("compactTitle")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            {t("compactDescription")}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => {
                void downloadStory();
              }}
              disabled={isBusy}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--brand)] bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isBusy && !storyFileReady ? (
                t("working")
              ) : (
                <>
                  <span className="sm:hidden">{t("openStoryImageButton")}</span>
                  <span className="hidden sm:inline">{t("downloadButton")}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                void shareStory();
              }}
              disabled={isBusy}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--brand)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isBusy && !storyFileReady ? t("working") : shareButtonLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                void copyLink();
              }}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-[var(--surface-soft)]"
            >
              {copyState === "done"
                ? t("copySuccess")
                : copyState === "error"
                ? t("copyError")
                : t("copyButton")}
            </button>
          </div>
          </div>
          <LocalizedLink
            href="/wanted"
            className="flex h-full flex-col justify-between rounded-xl border border-[var(--accent)]/35 bg-[var(--accent)]/5 px-4 py-4 transition hover:border-[var(--accent)]/60 hover:bg-[var(--accent)]/10"
          >
            <span>
              <span className="block text-sm font-semibold text-[var(--brand-dark)]">
                {t("wantedCompactTitle")}
              </span>
              <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">
                {t("wantedCompactText")}
              </span>
            </span>
            <span className="mt-3 inline-flex items-center text-sm font-semibold text-[var(--accent-dark)]">
              {t("wantedCompactButton")} <span aria-hidden="true" className="ml-1">{"->"}</span>
            </span>
          </LocalizedLink>
        </div>
        {shareHint ? (
          <p
            className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm font-medium text-[var(--brand-dark)]"
            role="status"
            aria-live="polite"
          >
            {shareHint}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section data-reveal className="mt-10 rounded-[32px] border border-[var(--border)] bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-7 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,360px)] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-3xl">
            {shareTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
            {t("description")}
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => {
                void shareStory();
              }}
              disabled={isBusy}
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[var(--brand)] px-6 py-4 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isBusy ? t("working") : shareButtonLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                void downloadStory();
              }}
              disabled={isBusy}
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-[var(--border)] bg-white px-6 py-4 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="sm:hidden">{t("openStoryImageButton")}</span>
              <span className="hidden sm:inline">{t("downloadButton")}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                void copyLink();
              }}
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-[var(--border)] bg-white px-6 py-4 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-[var(--surface-soft)]"
            >
              {copyState === "done" ? t("copySuccess") : copyState === "error" ? t("copyError") : t("copyButton")}
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm leading-6 text-[var(--muted)] backdrop-blur">
            <p className="font-semibold text-[var(--brand-dark)]">{t("tipTitle")}</p>
            <p className="mt-1">{t("tipText")}</p>
            {shareHint ? <p className="mt-2 font-medium text-[var(--brand)]">{shareHint}</p> : null}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <LocalizedLink
              href="/wanted"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition-colors duration-300 ease-out hover:bg-red-100"
            >
              {t("wantedPosterButton")}
            </LocalizedLink>
            <LocalizedLink
              href="/wanted"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-[var(--surface-soft)]"
            >
              {t("challengeButton")}
            </LocalizedLink>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[360px]">
          <div className="rounded-[34px] border border-[var(--border)] bg-[var(--surface-soft)]/60 p-3 shadow-sm">
            <div className="relative overflow-hidden rounded-[28px] bg-white aspect-[9/16]">
              {/* STORY READY pill — kept as a single mock-up label; the SHA bar
                  has been removed because the illustration carries SHA branding. */}
              <div className="absolute right-4 top-4">
                <div className="rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-dark)] backdrop-blur">
                  {t("storyBadge")}
                </div>
              </div>

              {/* Hero illustration — object-contain so the whole composition is
                  visible. Container takes the upper ~58% of the Story frame. */}
              <div className="absolute inset-x-5 top-10 bottom-[42%] rounded-xl border-[3px] border-[var(--brand-dark)] bg-[#fff8ed] p-5 shadow-md">
                <div className="h-full border border-amber-300 px-4 py-5 text-center">
                  <p className="font-serif text-2xl font-black tracking-wide text-[var(--brand-dark)]">
                    CERTIFICATE
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--brand-dark)]">
                    Official Recognition
                  </p>
                  <p className="mt-8 text-[10px] italic text-[var(--muted)]">
                    This certifies that
                  </p>
                  <p className="mt-3 break-words font-serif text-xl font-black uppercase leading-tight text-[var(--brand-dark)]">
                    {member.name}
                  </p>
                  <p className="mt-8 text-[10px] font-semibold text-[var(--muted)]">
                    has been officially recognized as
                  </p>
                  <p className="mt-3 break-words font-serif text-xl font-black uppercase tracking-wide text-[var(--brand-dark)]">
                    {tierLabel}
                  </p>
                  <p className="mt-8 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    {member.id}
                  </p>
                </div>
              </div>

              {/* Single merged identity + verification card. */}
              <div className="absolute inset-x-3 bottom-3 rounded-[22px] bg-[var(--brand-dark)] px-5 py-5 text-white shadow-lg">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
                  {tierLabel}
                </p>
                <p className="mt-1 text-base font-semibold leading-tight text-white">
                  {member.name}
                </p>
                <p className="mt-3 text-[22px] font-semibold leading-tight">
                  {t(`tierHeadlines.${member.tier}.previewHeadline`)}
                </p>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  {previewHost}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
