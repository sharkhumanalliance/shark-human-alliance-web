"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { CertificateDocument } from "@/components/certificate/certificate-document";
import {
  CertificateSheet,
  getPaperDimensions,
  type PaperFormat,
} from "@/components/certificate/certificate-sheet";
import { LocalizedLink } from "@/components/ui/localized-link";
import { trackEvent } from "@/components/analytics";
import { buildAbsoluteLocalizedUrl } from "@/lib/navigation";
import { getPublicTierKey, type PublicTierKey } from "@/lib/tiers";
import {
  normalizeTemplate,
  type CertificateTemplate,
} from "@/lib/certificate-templates";

interface PostPurchaseShareProps {
  member: {
    id: string;
    name: string;
    tier: PublicTierKey;
    dedication?: string | null;
    date?: string;
    referralCode?: string;
    accessToken?: string;
    template?: CertificateTemplate;
    paperFormat?: PaperFormat;
  };
  /**
   * "full"    — original layout with Story preview, headings and Wanted Poster CTAs.
   * "compact" — single horizontal action row used on the redesigned success page
   *             where the Hero already owns the primary action.
   */
  variant?: "full" | "compact";
}

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const MM_TO_PX = 96 / 25.4;

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

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read image blob."));
    reader.readAsDataURL(blob);
  });
}

async function getInlineImageSrc(src: string) {
  if (!src || src.startsWith("data:")) return src;
  const url = new URL(src, window.location.href);

  if (url.hostname === "api.qrserver.com") {
    const encodedData = url.searchParams.get("data");
    if (encodedData) {
      const qr = await import("qrcode");
      return qr.toDataURL(encodedData, {
        errorCorrectionLevel: "M",
        margin: 0,
        width: 200,
      });
    }
  }

  const response = await fetch(url.toString(), { mode: "cors" });
  if (!response.ok) {
    throw new Error(`Could not load image for share export: ${url.pathname}`);
  }
  return blobToDataUrl(await response.blob());
}

async function inlineImagesForSvg(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(async (image) => {
      const src = image.getAttribute("src");
      if (!src) return;
      try {
        image.setAttribute("src", await getInlineImageSrc(src));
      } catch {
        image.removeAttribute("src");
      }
    }),
  );
}

function collectDocumentCss() {
  const chunks: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      chunks.push(
        Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n"),
      );
    } catch {
      // Cross-origin stylesheets cannot be read. The app stylesheet is same-origin.
    }
  }
  return chunks.join("\n");
}

async function renderCertificateElementToImage(
  sourceElement: HTMLElement,
  paperFormat: PaperFormat,
) {
  await document.fonts?.ready;
  const clone = sourceElement.cloneNode(true) as HTMLElement;
  await inlineImagesForSvg(clone);

  const paper = getPaperDimensions(paperFormat);
  const width = Math.round(paper.width * MM_TO_PX);
  const height = Math.round(paper.height * MM_TO_PX);
  const styles = collectDocumentCss();
  const xhtml = `
    <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;margin:0;background:#fff;overflow:hidden;">
      <style>
        ${styles}
        * { box-sizing: border-box; }
        body { margin: 0; }
        img { max-width: none; }
      </style>
      ${clone.outerHTML}
    </div>
  `;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <foreignObject width="100%" height="100%">${xhtml}</foreignObject>
    </svg>
  `;
  const url = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return image;
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

function drawCertificateImage(
  ctx: CanvasRenderingContext2D,
  certificateImage: HTMLImageElement,
) {
  const target = { x: 100, y: 85, width: 880, height: 1120 };
  const sourceRatio = certificateImage.naturalWidth / certificateImage.naturalHeight;
  const targetRatio = target.width / target.height;
  const width = sourceRatio > targetRatio ? target.width : target.height * sourceRatio;
  const height = sourceRatio > targetRatio ? target.width / sourceRatio : target.height;
  const x = target.x + (target.width - width) / 2;
  const y = target.y + (target.height - height) / 2;

  ctx.save();
  ctx.shadowColor = "rgba(16, 41, 65, 0.22)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 24;
  drawRoundedRect(ctx, x - 18, y - 18, width + 36, height + 36, 22, "#ffffff");
  ctx.restore();
  ctx.drawImage(certificateImage, x, y, width, height);
}

async function generateStoryBlob({
  certificateElement,
  paperFormat,
  memberName,
  tierLabel,
  siteLabel,
  headlineTop,
  headlineBottom,
  footerLine,
}: {
  certificateElement: HTMLElement;
  paperFormat: PaperFormat;
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
  const certificateImage = await renderCertificateElementToImage(
    certificateElement,
    paperFormat,
  );
  drawCertificateImage(ctx, certificateImage);

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
  const certificateShareRef = useRef<HTMLDivElement>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "done" | "error">("idle");
  const [shareHint, setShareHint] = useState<string | null>(null);
  const certificateTemplate = normalizeTemplate(member.template);
  const paperFormat = member.paperFormat ?? "a4";
  const publicTier = getPublicTierKey(member.tier);
  const useNativePaperLayout =
    paperFormat === "letter" &&
    (certificateTemplate === "playful" ||
      (certificateTemplate === "luxury" &&
        (publicTier === "protected" ||
          publicTier === "nonsnack" ||
          publicTier === "business")));

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
    const certificateElement = certificateShareRef.current;
    if (!certificateElement) throw new Error("Certificate preview is not ready.");
    const blob = await generateStoryBlob({
      certificateElement,
      paperFormat,
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
          url: verificationUrl,
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

  const shareCertificateSource = (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed -left-[10000px] top-0 opacity-0"
    >
      <div ref={certificateShareRef}>
        <CertificateSheet
          paperFormat={paperFormat}
          useNativePaperLayout={useNativePaperLayout}
        >
          <CertificateDocument
            name={member.name}
            tier={publicTier}
            dedication={member.dedication}
            date={member.date ?? ""}
            registryId={member.id}
            referralCode={member.referralCode}
            accessToken={member.accessToken}
            priorityImages
            assetMode="full"
            template={certificateTemplate}
            paperFormat={paperFormat}
            locale={locale}
          />
        </CertificateSheet>
      </div>
    </div>
  );

  if (variant === "compact") {
    // Compact share row used on the redesigned success page. The Hero already
    // owns the primary action (Download certificate), so this strip is only a
    // secondary "share what you just got" affordance — no Story mock-up, no
    // Wanted Poster CTAs (those live in the dedicated secondary actions card).
    return (
      <>
        {shareCertificateSource}
        <section
          data-reveal
          className="mt-6 border-y border-[var(--border)] py-4"
        >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] shrink-0">
            {t("compactEyebrow")}
          </p>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                void shareStory();
              }}
              disabled={isBusy}
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-md border border-[var(--brand)] bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isBusy ? t("working") : shareButtonLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                void downloadStory();
              }}
              disabled={isBusy}
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {t("downloadButton")}
            </button>
            <button
              type="button"
              onClick={() => {
                void copyLink();
              }}
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-[var(--surface-soft)]"
            >
              {copyState === "done"
                ? t("copySuccess")
                : copyState === "error"
                ? t("copyError")
                : t("copyButton")}
            </button>
          </div>
        </div>
        {shareHint ? (
          <p
            className="mt-2 text-xs font-medium text-sky-800"
            role="status"
            aria-live="polite"
          >
            {shareHint}
          </p>
        ) : null}
        </section>
      </>
    );
  }

  return (
    <>
      {shareCertificateSource}
      <section data-reveal className="mt-10 rounded-[32px] border border-[var(--border)] bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-7 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,360px)] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">
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

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <LocalizedLink
              href="/wanted"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition-colors duration-300 ease-out hover:bg-red-100"
            >
              {t("wantedPosterButton")}
            </LocalizedLink>
            <LocalizedLink
              href="/wanted"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-sky-50"
            >
              {t("challengeButton")}
            </LocalizedLink>
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200">
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
    </>
  );
}
