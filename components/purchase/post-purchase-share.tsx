"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { trackEvent } from "@/components/analytics";
import { buildAbsoluteLocalizedUrl } from "@/lib/navigation";
import type { PublicTierKey } from "@/lib/tiers";

interface PostPurchaseShareProps {
  member: {
    id: string;
    name: string;
    tier: PublicTierKey;
  };
}

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const STORY_IMAGE_SRC = "/mascots/case-closed-share.png";

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
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

async function generateStoryBlob({
  memberName,
  tierLabel,
  siteLabel,
  headlineTop,
  headlineBottom,
  footerLine,
}: {
  memberName: string;
  tierLabel: string;
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
  const heroImage = await loadImage(STORY_IMAGE_SRC);
  const imageBox = { x: 60, y: 60, width: 960, height: 1140 };
  const scale = Math.min(
    imageBox.width / heroImage.width,
    imageBox.height / heroImage.height
  );
  const drawWidth = heroImage.width * scale;
  const drawHeight = heroImage.height * scale;
  const drawX = imageBox.x + (imageBox.width - drawWidth) / 2;
  const drawY = imageBox.y + (imageBox.height - drawHeight) / 2;
  ctx.drawImage(heroImage, drawX, drawY, drawWidth, drawHeight);

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

export function PostPurchaseShare({ member }: PostPurchaseShareProps) {
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

  async function getStoryFile() {
    const blob = await generateStoryBlob({
      memberName: member.name,
      tierLabel,
      siteLabel: previewHost,
      headlineTop: t(`tierHeadlines.${member.tier}.headlineTop`),
      headlineBottom: t(`tierHeadlines.${member.tier}.headlineBottom`),
      footerLine: t("storyFooterLine"),
    });
    return new File([blob], fileName, { type: "image/png" });
  }

  async function downloadStory(options?: { preserveBusyState?: boolean }) {
    if (!options?.preserveBusyState) setIsBusy(true);
    setShareHint(null);
    try {
      const file = await getStoryFile();
      const objectUrl = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = file.name;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      trackEvent("share_story_downloaded", { tier: member.tier });
      setShareHint(t("downloadReady"));
    } catch {
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
      const file = await getStoryFile();
      const shareNavigator = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };

      if (shareNavigator.share && shareNavigator.canShare?.({ files: [file] })) {
        await shareNavigator.share({
          files: [file],
          title: t(`tierHeadlines.${member.tier}.nativeTitle`),
          text: `${t(`tierHeadlines.${member.tier}.nativeText`)} ${verificationUrl}`,
        });
        trackEvent("share_story_native_success", { tier: member.tier, mode: "file" });
        setShareHint(t("nativeSuccess"));
        return;
      }

      if (shareNavigator.share) {
        await shareNavigator.share({
          title: t(`tierHeadlines.${member.tier}.nativeTitle`),
          text: t(`tierHeadlines.${member.tier}.nativeText`),
          url: verificationUrl,
        });
        trackEvent("share_story_native_success", { tier: member.tier, mode: "url" });
        setShareHint(t("nativeFallback"));
        return;
      }

      await downloadStory({ preserveBusyState: true });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setShareHint(null);
        return;
      }
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

  return (
    <section data-reveal className="mt-10 rounded-[32px] border border-[var(--border)] bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-7 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,360px)] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-800">
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
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-[var(--border)] bg-white px-6 py-4 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {t("downloadButton")}
            </button>
            <button
              type="button"
              onClick={() => {
                void copyLink();
              }}
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-[var(--border)] bg-white px-6 py-4 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-sky-50"
            >
              {copyState === "done" ? t("copySuccess") : copyState === "error" ? t("copyError") : t("copyButton")}
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm leading-6 text-[var(--muted)] backdrop-blur">
            <p className="font-semibold text-[var(--brand-dark)]">{t("tipTitle")}</p>
            <p className="mt-1">{t("tipText")}</p>
            {shareHint ? <p className="mt-2 font-medium text-sky-800">{shareHint}</p> : null}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[360px]">
          <div className="rounded-[34px] border border-[var(--border)] bg-[var(--surface-soft)]/60 p-3 shadow-sm">
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-sky-50 via-white to-white aspect-[9/16]">
              {/* STORY READY pill — kept as a single mock-up label; the SHA bar
                  has been removed because the illustration carries SHA branding. */}
              <div className="absolute right-4 top-4">
                <div className="rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-900 backdrop-blur">
                  {t("storyBadge")}
                </div>
              </div>

              {/* Hero illustration — object-contain so the whole composition is
                  visible. Container takes the upper ~58% of the Story frame. */}
              <div className="absolute inset-x-3 top-3 bottom-[42%]">
                <Image
                  src={STORY_IMAGE_SRC}
                  alt={t("previewAlt")}
                  fill
                  sizes="(max-width: 1024px) 320px, 360px"
                  className="object-contain"
                  priority={false}
                />
              </div>

              {/* Single merged identity + verification card. */}
              <div className="absolute inset-x-3 bottom-3 rounded-[22px] bg-[var(--brand-dark)] px-5 py-5 text-white shadow-lg">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-200">
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
