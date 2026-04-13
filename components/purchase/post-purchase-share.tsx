"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { trackEvent } from "@/components/analytics";
import { buildAbsoluteLocalizedUrl } from "@/lib/navigation";

type Tier = "basic" | "protected" | "nonsnack" | "business";

interface PostPurchaseShareProps {
  member: {
    id: string;
    name: string;
    tier: Tier;
  };
}

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const STORY_IMAGE_SRC = "/mascots/finnley-luna-hero-v2.webp";

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
  subline,
  siteLabel,
}: {
  memberName: string;
  tierLabel: string;
  subline: string;
  siteLabel: string;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");

  const gradient = ctx.createLinearGradient(0, 0, STORY_WIDTH, STORY_HEIGHT);
  gradient.addColorStop(0, "#e8fbff");
  gradient.addColorStop(0.45, "#d8f2ff");
  gradient.addColorStop(1, "#fff7e9");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = "#0f4c81";
  for (let i = 0; i < 12; i += 1) {
    ctx.beginPath();
    ctx.arc(120 + i * 90, 150 + (i % 3) * 24, 6 + (i % 4), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  drawRoundedRect(ctx, 70, 72, 260, 64, 32, "rgba(15, 76, 129, 0.1)");
  ctx.fillStyle = "#0f4c81";
  ctx.font = "700 28px Arial, Helvetica, sans-serif";
  ctx.fillText("SHA", 155, 114);
  ctx.font = "600 22px Arial, Helvetica, sans-serif";
  ctx.fillText("Shark Human Alliance", 356, 114);

  const heroImage = await loadImage(STORY_IMAGE_SRC);
  const imageBox = { x: 80, y: 170, width: 920, height: 720 };
  drawRoundedRect(ctx, imageBox.x, imageBox.y, imageBox.width, imageBox.height, 42, "rgba(255,255,255,0.92)");
  ctx.save();
  ctx.beginPath();
  drawRoundedRect(ctx, imageBox.x, imageBox.y, imageBox.width, imageBox.height, 42, "#ffffff");
  ctx.clip();
  const scale = Math.max(imageBox.width / heroImage.width, imageBox.height / heroImage.height);
  const drawWidth = heroImage.width * scale;
  const drawHeight = heroImage.height * scale;
  const drawX = imageBox.x + (imageBox.width - drawWidth) / 2;
  const drawY = imageBox.y + (imageBox.height - drawHeight) / 2;
  ctx.drawImage(heroImage, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();

  drawRoundedRect(ctx, 108, 204, 286, 58, 29, "rgba(255,255,255,0.88)");
  ctx.fillStyle = "#0f4c81";
  ctx.font = "700 22px Arial, Helvetica, sans-serif";
  ctx.fillText("Officially certified", 145, 241);

  ctx.fillStyle = "#0d2340";
  ctx.font = "700 76px Arial, Helvetica, sans-serif";
  ctx.fillText("You are", 82, 1000);
  ctx.fillText("not a snack.", 82, 1088);

  drawRoundedRect(ctx, 80, 1138, 920, 188, 40, "rgba(255,255,255,0.92)");
  const tierFontSize = fitText(ctx, tierLabel, 820, 58, 36);
  ctx.fillStyle = "#0f4c81";
  ctx.font = `700 ${tierFontSize}px Arial, Helvetica, sans-serif`;
  ctx.fillText(tierLabel, 130, 1218);

  const nameFontSize = fitText(ctx, memberName, 820, 54, 32);
  ctx.fillStyle = "#0d2340";
  ctx.font = `700 ${nameFontSize}px Arial, Helvetica, sans-serif`;
  ctx.fillText(memberName, 130, 1288);

  drawRoundedRect(ctx, 80, 1368, 920, 220, 40, "#0f4c81");
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 48px Arial, Helvetica, sans-serif";
  ctx.fillText(subline, 132, 1450);
  ctx.font = "600 30px Arial, Helvetica, sans-serif";
  ctx.fillText("Bureaucratic progress in shark-human relations.", 132, 1514);
  ctx.fillText(siteLabel, 132, 1562);

  ctx.fillStyle = "rgba(13, 35, 64, 0.78)";
  ctx.font = "600 28px Arial, Helvetica, sans-serif";
  ctx.fillText("Post this to your Stories. Let the public know you're off the menu.", 80, 1690);

  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = "#0f4c81";
  ctx.beginPath();
  ctx.arc(930, 1730, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(1010, 1825, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

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
  const fileName = useMemo(() => `shark-human-alliance-story-${member.id.toLowerCase()}.png`, [member.id]);

  async function getStoryFile() {
    const blob = await generateStoryBlob({
      memberName: member.name,
      tierLabel,
      subline: t("storySubline"),
      siteLabel: verificationUrl || "sharkhumanalliance.com",
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
          title: t("nativeTitle"),
          text: `${t("nativeText")} ${verificationUrl}`,
        });
        trackEvent("share_story_native_success", { tier: member.tier, mode: "file" });
        setShareHint(t("nativeSuccess"));
        return;
      }

      if (shareNavigator.share) {
        await shareNavigator.share({
          title: t("nativeTitle"),
          text: t("nativeText"),
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
    <section data-reveal className="mt-10 rounded-[32px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-amber-50 px-4 py-5 shadow-[0_24px_80px_rgba(15,76,129,0.08)] sm:px-6 sm:py-7 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,360px)] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-800">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-3xl">
            {t("title")}
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
              {isBusy ? t("working") : t("shareButton")}
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
          <div className="rounded-[34px] border border-sky-100 bg-[#f7fbff] p-3 shadow-[0_20px_60px_rgba(15,76,129,0.12)]">
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-sky-100 via-white to-amber-50 aspect-[9/16]">
              <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5">
                <div className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-900 backdrop-blur">
                  SHA
                </div>
                <div className="rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-900 backdrop-blur">
                  {t("storyBadge")}
                </div>
              </div>

              <div className="absolute inset-x-4 top-16 overflow-hidden rounded-[26px] border border-white/70 bg-white/70 shadow-sm">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={STORY_IMAGE_SRC}
                    alt={t("previewAlt")}
                    fill
                    sizes="(max-width: 1024px) 320px, 360px"
                    className="object-cover"
                    priority={false}
                  />
                </div>
              </div>

              <div className="absolute inset-x-5 top-[52%] rounded-[24px] bg-white/92 px-4 py-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-800">
                  {tierLabel}
                </p>
                <p className="mt-2 text-xl font-semibold leading-tight text-[var(--brand-dark)]">
                  {member.name}
                </p>
              </div>

              <div className="absolute inset-x-5 bottom-5 rounded-[24px] bg-[var(--brand-dark)] px-5 py-5 text-white shadow-lg">
                <p className="text-[26px] font-semibold leading-tight">
                  {t("previewHeadline")}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  {t("previewSubline")}
                </p>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 break-all">
                  {verificationUrl.replace(/^https?:\/\//, "")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
