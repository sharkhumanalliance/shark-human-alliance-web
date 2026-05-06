"use client";

import { useLocale, useTranslations } from "next-intl";
import * as QRCode from "qrcode";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { LocalizedLink } from "@/components/ui/localized-link";
import { trackEvent } from "@/components/analytics";
import { buildAbsoluteLocalizedUrl } from "@/lib/navigation";

function nameHash(name: string): number {
  let hash = 0;
  const source = name || "default";
  for (let i = 0; i < source.length; i++) {
    hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function fitCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  initialSize: number,
  minSize: number,
  weight = 600,
) {
  let fontSize = initialSize;
  while (fontSize > minSize) {
    ctx.font = `${weight} ${fontSize}px 'Geist', sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    fontSize -= 2;
  }
  return fontSize;
}

function wrapCanvasLines(
  ctx: CanvasRenderingContext2D,
  text: unknown,
  maxWidth: number,
) {
  const source = typeof text === "string" ? text : String(text ?? "");
  const words = source.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function fitCanvasWrappedText(
  ctx: CanvasRenderingContext2D,
  text: unknown,
  maxWidth: number,
  initialSize: number,
  minSize: number,
  weight = 600,
  maxLines = 2,
) {
  let fontSize = initialSize;
  const source = typeof text === "string" ? text : String(text ?? "");
  let lines: string[] = [source];

  while (fontSize > minSize) {
    ctx.font = `${weight} ${fontSize}px 'Geist', sans-serif`;
    lines = wrapCanvasLines(ctx, source, maxWidth);
    if (lines.length <= maxLines) break;
    fontSize -= 2;
  }

  ctx.font = `${weight} ${fontSize}px 'Geist', sans-serif`;
  lines = wrapCanvasLines(ctx, source, maxWidth);

  return { fontSize, lines };
}

const POSTER_BG = "#3a2515";
const POSTER_PAPER = "#f6ecd8";
const POSTER_INK = "#102941";
const POSTER_RED = "#b94135";
const POSTER_GOLD = "#b98935";
const POSTER_MUTED = "#6f7c83";
const POSTER_INK_DARK = "#7a2a22"; // darker red for ink-bleed dots
const POSTER_PAPER_GRAIN = "#c9b88a"; // mid-tone for procedural paper grain

type WantedTone = "mild" | "clear" | "emergency";

const WANTED_TONES: WantedTone[] = ["mild", "clear", "emergency"];

type PosterFormat = "a4" | "story";

const POSTER_FORMATS: PosterFormat[] = ["a4", "story"];

function readRawMessages<T>(reader: () => T, fallback: T) {
  try {
    return reader();
  } catch {
    return fallback;
  }
}

function normalizeStringList(value: unknown): string[] {
  const rawItems = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? Object.entries(value)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([, item]) => item)
      : [];

  return rawItems.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

interface PosterLayout {
  width: number;
  height: number;
  marginX: number;
  marginY: number;
  qrSize: number;
  aspectRatio: string;
}

const POSTER_LAYOUTS: Record<PosterFormat, PosterLayout> = {
  a4: {
    width: 2100,
    height: 2970,
    marginX: 120,
    marginY: 140,
    qrSize: 360,
    aspectRatio: "210 / 297",
  },
  story: {
    width: 1080,
    height: 1920,
    marginX: 36,
    marginY: 42,
    qrSize: 280,
    aspectRatio: "108 / 192",
  },
};

function drawQrCode(
  ctx: CanvasRenderingContext2D,
  url: string,
  x: number,
  y: number,
  size: number,
) {
  const qr = QRCode.create(url, { errorCorrectionLevel: "M" });
  const moduleCount = qr.modules.size;
  const cellSize = size / moduleCount;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = "#000000";

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (qr.modules.get(row, col)) {
        const cellX = x + col * cellSize;
        const cellY = y + row * cellSize;
        ctx.fillRect(cellX, cellY, Math.ceil(cellSize), Math.ceil(cellSize));
      }
    }
  }
}

function drawQrFallback(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  const cell = size / 9;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = Math.max(2, cell * 0.18);

  const finder = (fx: number, fy: number) => {
    ctx.strokeRect(fx, fy, cell * 2.4, cell * 2.4);
    ctx.fillStyle = "#000000";
    ctx.fillRect(fx + cell * 0.7, fy + cell * 0.7, cell, cell);
    ctx.fillStyle = "#ffffff";
  };

  finder(x + cell, y + cell);
  finder(x + size - cell * 3.4, y + cell);
  finder(x + cell, y + size - cell * 3.4);

  ctx.fillStyle = "#000000";
  const dots = [
    [4, 3],
    [5, 3],
    [7, 4],
    [3, 5],
    [5, 5],
    [6, 6],
    [4, 7],
    [7, 7],
  ];
  dots.forEach(([col, row]) => {
    ctx.fillRect(x + col * cell, y + row * cell, cell * 0.7, cell * 0.7);
  });
}

function drawQrCodeSafe(
  ctx: CanvasRenderingContext2D,
  url: string,
  x: number,
  y: number,
  size: number,
) {
  try {
    drawQrCode(ctx, url, x, y, size);
  } catch (error) {
    console.error("[Wanted poster] QR render failed", error);
    drawQrFallback(ctx, x, y, size);
  }
}

// Seeded random — deterministic per name + reroll seed so the procedural
// distress and texture stay consistent for the same inputs.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function WantedContent() {
  const t = useTranslations("wanted");
  const locale = useLocale();
  const [name, setName] = useState("");
  const [selectedTone, setSelectedTone] = useState<WantedTone>("clear");
  const [posterFormat, setPosterFormat] = useState<PosterFormat>("a4");
  const [rerollSeed, setRerollSeed] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [useTilt, setUseTilt] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toneCharges = useMemo(() => {
    return normalizeStringList(t.raw(`toneCharges.${selectedTone}`));
  }, [selectedTone, t]);

  const commonCharges = useMemo(() => {
    return normalizeStringList(readRawMessages(() => t.raw("commonCharges"), []));
  }, [t]);

  const charges = useMemo(() => {
    return [...toneCharges, ...commonCharges];
  }, [toneCharges, commonCharges]);

  const tonePosterSubtitles = useMemo(() => {
    const subtitles = normalizeStringList(
      readRawMessages(() => t.raw(`posterSubtitles.${selectedTone}`), []),
    );
    return subtitles.length > 0 ? subtitles : [t(`tones.${selectedTone}.posterSubtitle`)];
  }, [selectedTone, t]);

  const caseDetails = useMemo(() => {
    return normalizeStringList(readRawMessages(() => t.raw("caseDetails"), []));
  }, [t]);

  // Salt hash with the reroll counter so users can cycle through different
  // 3-charge combinations for the same name + tone.
  const seededHash = useMemo(
    () => nameHash(`${name}::${rerollSeed}`),
    [name, rerollSeed],
  );

  const selectedCharges = useMemo(() => {
    if (charges.length === 0) return [];

    const pool = [...charges];
    const rng = mulberry32(seededHash);

    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    return pool.slice(0, Math.min(3, pool.length));
  }, [seededHash, charges]);

  const selectedPosterSubtitle = useMemo(() => {
    if (tonePosterSubtitles.length === 0) return t(`tones.${selectedTone}.posterSubtitle`);
    return tonePosterSubtitles[seededHash % tonePosterSubtitles.length];
  }, [seededHash, selectedTone, t, tonePosterSubtitles]);

  const selectedCaseDetail = useMemo(() => {
    if (caseDetails.length > 0) {
      const baseIndex = nameHash(`${name.trim() || "default"}::case-detail`);
      return caseDetails[(baseIndex + rerollSeed) % caseDetails.length];
    }
    return "Records show confidence, sunscreen, and no marine filing.";
  }, [caseDetails, name, rerollSeed]);

  // Loads any same-origin image (e.g. /public assets) for the canvas. We set
  // crossOrigin so the canvas remains exportable via toBlob even when other
  // images on the same canvas (the QR) require CORS.
  const loadPosterImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const drawPoster = useCallback(
    async (ctx: CanvasRenderingContext2D, layout: PosterLayout) => {
      const { width, height, marginX, marginY, qrSize } = layout;
      // Reference the original A4 design at 2100 wide; everything scales from
      // there so the same drawing code produces both the A4 (2100 × 2970)
      // print version and the 9:16 Story (1080 × 1920) export.
      const scale = width / 2100;
      const s = (n: number) => n * scale;
      const isStory = posterFormat === "story";

      const displayName = name.trim() || t("defaultName");
      const distressRng = mulberry32(seededHash);

      ctx.fillStyle = POSTER_BG;
      ctx.fillRect(0, 0, width, height);

      const paperWidth = width - marginX * 2;
      const paperHeight = height - marginY * 2;

      ctx.fillStyle = POSTER_PAPER;
      ctx.beginPath();
      ctx.roundRect(marginX, marginY, paperWidth, paperHeight, s(16));
      ctx.fill();

      // Procedural paper grain — subtle noise dots over the parchment so it
      // doesn't read as a flat fill. Deterministic per seed.
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(marginX, marginY, paperWidth, paperHeight, s(16));
      ctx.clip();
      const grainCount = Math.round(paperWidth * paperHeight * 0.0006);
      const grainRng = mulberry32(0x9e3779b9);
      ctx.fillStyle = POSTER_PAPER_GRAIN;
      for (let i = 0; i < grainCount; i++) {
        const gx = marginX + grainRng() * paperWidth;
        const gy = marginY + grainRng() * paperHeight;
        const gr = s(0.6 + grainRng() * 1.6);
        const ga = 0.06 + grainRng() * 0.08;
        ctx.globalAlpha = ga;
        ctx.beginPath();
        ctx.arc(gx, gy, gr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // A few longer "fiber" strokes for paper texture authenticity.
      ctx.strokeStyle = POSTER_PAPER_GRAIN;
      const fiberCount = Math.round(paperWidth * 0.012);
      for (let i = 0; i < fiberCount; i++) {
        const fx = marginX + grainRng() * paperWidth;
        const fy = marginY + grainRng() * paperHeight;
        const fl = s(8 + grainRng() * 22);
        const angle = grainRng() * Math.PI * 2;
        ctx.globalAlpha = 0.06 + grainRng() * 0.08;
        ctx.lineWidth = s(0.6);
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + Math.cos(angle) * fl, fy + Math.sin(angle) * fl);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // Single decorative inner frame (the second nested frame has been removed
      // — parchment has its own visual texture, two stacked frames added noise).
      ctx.strokeStyle = POSTER_MUTED;
      ctx.lineWidth = s(3);
      ctx.beginPath();
      ctx.roundRect(
        marginX + s(36),
        marginY + s(36),
        paperWidth - s(72),
        paperHeight - s(72),
        s(10),
      );
      ctx.stroke();

      if (isStory) {
        const centerX = width / 2;
        const caseNumber = `SHA-${nameHash(displayName).toString().slice(-4).padStart(4, "0")}`;

        ctx.fillStyle = POSTER_MUTED;
        ctx.font = `700 ${s(46)}px 'Geist', sans-serif`;
        ctx.textAlign = "center";
        ctx.letterSpacing = `${s(12)}px`;
        ctx.fillText(t("posterHeader").toUpperCase(), centerX, marginY + s(114));
        ctx.letterSpacing = "0px";
        ctx.textAlign = "right";
        ctx.font = `600 ${s(30)}px 'Geist', sans-serif`;
        ctx.fillText(caseNumber, marginX + paperWidth - s(72), marginY + s(144));
        ctx.textAlign = "center";

        ctx.fillStyle = POSTER_RED;
        ctx.font = `900 ${s(224)}px 'Geist', sans-serif`;
        const wantedTitle = t("wantedTitle");
        const wantedY = marginY + s(352);
        ctx.fillText(wantedTitle, centerX, wantedY);
        const wantedMetrics = ctx.measureText(wantedTitle);
        const wantedW = wantedMetrics.width;
        const wantedH = s(190);
        const wantedLeft = centerX - wantedW / 2;
        const wantedTop = wantedY - wantedH * 0.85;
        ctx.fillStyle = POSTER_PAPER;
        for (let i = 0; i < 4; i += 1) {
          const sx = wantedLeft + distressRng() * wantedW;
          const sy = wantedTop + distressRng() * wantedH;
          const slen = wantedW * (0.18 + distressRng() * 0.18);
          const sthick = s(3 + distressRng() * 5);
          ctx.globalAlpha = 0.45 + distressRng() * 0.25;
          ctx.fillRect(sx, sy, slen, sthick);
        }
        ctx.fillStyle = "#8f261f";
        for (let i = 0; i < 8; i += 1) {
          const bx = wantedLeft + distressRng() * wantedW;
          const by = wantedTop + distressRng() * wantedH;
          const br = s(3 + distressRng() * 6);
          ctx.globalAlpha = 0.18 + distressRng() * 0.22;
          ctx.beginPath();
          ctx.arc(bx, by, br, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = POSTER_PAPER;
        ctx.globalAlpha = 0.5;
        const dropX = wantedLeft + wantedW * (0.25 + distressRng() * 0.5);
        const dropY = wantedTop + wantedH * (0.3 + distressRng() * 0.4);
        const dropR = s(16 + distressRng() * 10);
        ctx.beginPath();
        const dropPoints = 7 + Math.floor(distressRng() * 3);
        for (let i = 0; i < dropPoints; i += 1) {
          const angle = (i / dropPoints) * Math.PI * 2;
          const r = dropR * (0.5 + distressRng() * 0.7);
          const px = dropX + Math.cos(angle) * r;
          const py = dropY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = POSTER_RED;
        ctx.lineWidth = s(6);
        ctx.beginPath();
        ctx.moveTo(centerX - s(340), wantedY + s(44));
        ctx.lineTo(centerX + s(340), wantedY + s(44));
        ctx.stroke();

        // Subtitle goes ABOVE the name — reads as "WANTED for what" before
        // identifying the suspect, matching the natural flow of a real
        // wanted poster (verb of accusation → name).
        const subtitleY = marginY + s(532);
        const subtitleText = selectedPosterSubtitle.toUpperCase();
        const subtitleFit = fitCanvasWrappedText(
          ctx,
          subtitleText,
          paperWidth - s(340),
          s(58),
          s(36),
          800,
          3,
        );
        const subtitleLineHeight = subtitleFit.fontSize * 1.2;
        ctx.fillStyle = POSTER_INK;
        ctx.font = `800 ${subtitleFit.fontSize}px 'Geist', sans-serif`;
        ctx.textAlign = "center";
        ctx.letterSpacing = `${s(3)}px`;
        subtitleFit.lines.forEach((line, index) => {
          ctx.fillText(line, centerX, subtitleY + index * subtitleLineHeight);
        });
        ctx.letterSpacing = "0px";

        ctx.fillStyle = POSTER_INK;
        let nameFontSize = s(150);
        ctx.font = `900 ${nameFontSize}px 'Geist', sans-serif`;
        while (ctx.measureText(displayName).width > paperWidth - s(180) && nameFontSize > s(58)) {
          nameFontSize -= s(4);
          ctx.font = `900 ${nameFontSize}px 'Geist', sans-serif`;
        }
        const nameY = marginY + s(770);
        ctx.fillText(displayName, centerX, nameY);
        const nameWidth = Math.min(ctx.measureText(displayName).width + s(64), paperWidth - s(220));
        ctx.strokeStyle = POSTER_GOLD;
        ctx.lineWidth = s(3);
        ctx.beginPath();
        ctx.moveTo(centerX - nameWidth / 2, nameY + s(34));
        ctx.lineTo(centerX + nameWidth / 2, nameY + s(34));
        ctx.stroke();

        const fieldsRowY = nameY + s(250);
        const fieldsTotalWidth = paperWidth - s(240);
        const fieldsX = marginX + (paperWidth - fieldsTotalWidth) / 2;
        const fieldGap = s(24);
        const fieldWidth = (fieldsTotalWidth - fieldGap * 2) / 3;
        const fields = [
          { label: t("caseStatusLabel"), value: t(`tones.${selectedTone}.caseStatus`) },
          { label: t("riskLevelLabel"), value: t(`tones.${selectedTone}.riskLevel`) },
          { label: t("recommendedActionLabel"), value: t(`tones.${selectedTone}.recommendedAction`) },
        ];
        fields.forEach((field, index) => {
          const x = fieldsX + index * (fieldWidth + fieldGap);
          ctx.fillStyle = POSTER_MUTED;
          ctx.font = `700 ${s(32)}px 'Geist', sans-serif`;
          ctx.letterSpacing = `${s(2)}px`;
          ctx.fillText(field.label.toUpperCase(), x + fieldWidth / 2, fieldsRowY);
          ctx.letterSpacing = "0px";
          ctx.fillStyle = POSTER_INK;
          ctx.font = `700 ${s(53)}px 'Courier New', 'Courier', monospace`;
          ctx.fillText(field.value, x + fieldWidth / 2, fieldsRowY + s(58));
          ctx.strokeStyle = POSTER_MUTED;
          ctx.lineWidth = s(1.5);
          ctx.setLineDash([s(4), s(4)]);
          ctx.beginPath();
          ctx.moveTo(x + s(10), fieldsRowY + s(78));
          ctx.lineTo(x + fieldWidth - s(10), fieldsRowY + s(78));
          ctx.stroke();
          ctx.setLineDash([]);
        });

        const incidentsX = marginX + s(150);
        const incidentsWidth = paperWidth - s(300);
        const incidentTextSize = s(72);
        const incidentLineHeight = s(90);
        ctx.font = `500 ${incidentTextSize}px 'Geist', sans-serif`;
        const wrappedCharges = selectedCharges.map((charge) => {
          const lines = wrapCanvasLines(ctx, charge, incidentsWidth - s(180));
          return { prefix: "—", lines };
        });

        const incidentsTitleY = fieldsRowY + s(276);

        let watermarkImg: HTMLImageElement | null = null;
        try {
          watermarkImg = await loadPosterImage("/wanted-poster_picture.png");
        } catch {
          watermarkImg = null;
        }

        if (watermarkImg) {
          const photoAspect =
            watermarkImg.naturalWidth && watermarkImg.naturalHeight
              ? watermarkImg.naturalWidth / watermarkImg.naturalHeight
              : 1448 / 1086;
          // Watermark = 70 % of the paper width, centered behind the
          // incidents block. Sized in canvas pixels (not via s()) so it
          // remains a fixed proportion of the page rather than scaling
          // with the design grid.
          const watermarkW = paperWidth * 0.76;
          const watermarkH = watermarkW / photoAspect;
          // Position vertically so the figure spans roughly the full
          // incidents area — starts below the generated case note and centers
          // within the lower half of the page.
          const watermarkY = incidentsTitleY + s(40);
          ctx.save();
          ctx.globalAlpha = 0.18;
          ctx.drawImage(
            watermarkImg,
            centerX - watermarkW / 2,
            watermarkY,
            watermarkW,
            watermarkH,
          );
          ctx.restore();
        }

        // Gold rather than red — only the WANTED title should claim the
        // strongest red on the poster. Gold matches the underline beneath
        // the name and feels editorial, not alarmist.
        ctx.fillStyle = POSTER_GOLD;
        ctx.font = `800 ${s(58)}px 'Geist', sans-serif`;
        ctx.textAlign = "center";
        ctx.letterSpacing = `${s(4)}px`;
        ctx.fillText(t("chargesLabel").toUpperCase(), centerX, incidentsTitleY);
        ctx.letterSpacing = "0px";

        let incidentsCursorY = incidentsTitleY + s(208);
        ctx.textAlign = "left";
        wrappedCharges.forEach((charge) => {
          ctx.fillStyle = POSTER_INK;
          ctx.globalAlpha = 0.72;
          ctx.font = `650 ${incidentTextSize}px 'Geist', sans-serif`;
          ctx.fillText(charge.prefix, incidentsX, incidentsCursorY);
          ctx.globalAlpha = 1;
          ctx.font = `500 ${incidentTextSize}px 'Geist', sans-serif`;
          charge.lines.forEach((currentLine, lineIndex) => {
            ctx.fillText(currentLine, incidentsX + s(92), incidentsCursorY + lineIndex * incidentLineHeight);
          });
          incidentsCursorY += charge.lines.length * incidentLineHeight + s(86);
          ctx.strokeStyle = "rgba(111, 124, 131, 0.42)";
          ctx.lineWidth = s(1.5);
          ctx.beginPath();
          ctx.moveTo(incidentsX, incidentsCursorY - s(12));
          ctx.lineTo(incidentsX + incidentsWidth, incidentsCursorY - s(12));
          ctx.stroke();
          incidentsCursorY += s(72);
        });

        const trimmedName = name.trim();
        const shortCaseParams = new URLSearchParams({ t: selectedTone });
        if (trimmedName) shortCaseParams.set("n", trimmedName);
        const shortCasePath = `/w?${shortCaseParams.toString()}`;
        const caseUrlForQr =
          typeof window !== "undefined"
            ? buildAbsoluteLocalizedUrl(window.location.origin, locale, shortCasePath)
            : buildAbsoluteLocalizedUrl(
                process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com",
                locale,
                shortCasePath,
              );

        const qrX = centerX - qrSize / 2;
        const qrY = height - marginY - s(860);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(qrX - s(14), qrY - s(14), qrSize + s(28), qrSize + s(28), s(12));
        ctx.fill();
        ctx.strokeStyle = POSTER_RED;
        ctx.lineWidth = s(4);
        ctx.beginPath();
        ctx.roundRect(qrX - s(14), qrY - s(14), qrSize + s(28), qrSize + s(28), s(12));
        ctx.stroke();
        drawQrCodeSafe(ctx, caseUrlForQr, qrX, qrY, qrSize);

        const qrCtaName = name.trim().split(/\s+/)[0]?.toUpperCase() ?? "";
        const qrCtaText =
          qrCtaName && qrCtaName.length <= 14
            ? t("qrCtaLabel", { name: qrCtaName })
            : t("qrCtaFallbackLabel");
        const qrCtaFontSize = fitCanvasText(
          ctx,
          qrCtaText,
          paperWidth - s(210),
          s(68),
          s(42),
          800,
        );
        ctx.fillStyle = POSTER_RED;
        ctx.font = `800 ${qrCtaFontSize}px 'Geist', sans-serif`;
        ctx.textAlign = "center";
        ctx.letterSpacing = `${s(2)}px`;
        ctx.fillText(qrCtaText, centerX, qrY + qrSize + s(96));
        ctx.letterSpacing = "0px";

        // Footer URL with stronger contrast than the muted gray used
        // elsewhere — this is the only piece of plain-text branding on the
        // poster, so it deserves to be readable on a phone screen.
        ctx.fillStyle = "rgba(16, 41, 65, 0.86)";
        const footerText = t("posterFooter");
        const footerFontSize = fitCanvasText(ctx, footerText, paperWidth - s(140), s(50), s(34), 600);
        ctx.font = `600 ${footerFontSize}px 'Geist', sans-serif`;
        ctx.fillText(footerText, centerX, height - marginY - s(52));
        return;
      }

      let y = marginY + s(isStory ? 140 : 145);
      const centerX = width / 2;
      const caseNumber = `SHA-${nameHash(displayName).toString().slice(-4).padStart(4, "0")}`;

      ctx.fillStyle = POSTER_MUTED;
      ctx.font = `600 ${s(32)}px 'Geist', sans-serif`;
      ctx.textAlign = "center";
      ctx.letterSpacing = `${s(12)}px`;
      ctx.fillText(t("posterHeader").toUpperCase(), centerX, y);
      ctx.letterSpacing = "0px";
      y += s(54);

      ctx.strokeStyle = POSTER_MUTED;
      ctx.lineWidth = s(1.5);
      ctx.beginPath();
      ctx.moveTo(centerX - s(260), y);
      ctx.lineTo(centerX + s(260), y);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillStyle = POSTER_MUTED;
      ctx.font = `600 ${s(22)}px 'Geist', sans-serif`;
      ctx.fillText(caseNumber, marginX + paperWidth - s(92), y - s(18));
      ctx.textAlign = "center";
      y += s(124);

      ctx.fillStyle = POSTER_RED;
      ctx.font = `900 ${s(200)}px 'Geist', sans-serif`;
      const wantedTitle = t("wantedTitle");
      ctx.fillText(wantedTitle, centerX, y);

      // Procedural distress on WANTED — three layers of overlays seeded by
      // the name hash so the same name always gets the same wear pattern.
      const wantedMetrics = ctx.measureText(wantedTitle);
      const wantedW = wantedMetrics.width;
      const wantedH = s(170); // approx visual height for 200px Geist 900
      const wantedLeft = centerX - wantedW / 2;
      const wantedTop = y - wantedH * 0.85;

      // Layer 1: horizontal "press wear" scratches in parchment color
      ctx.fillStyle = POSTER_PAPER;
      const scratchCount = 4;
      for (let i = 0; i < scratchCount; i++) {
        const sx = wantedLeft + distressRng() * wantedW;
        const sy = wantedTop + distressRng() * wantedH;
        const slen = wantedW * (0.18 + distressRng() * 0.18);
        const sthick = s(2 + distressRng() * 4);
        ctx.globalAlpha = 0.45 + distressRng() * 0.25;
        ctx.fillRect(sx, sy, slen, sthick);
      }

      // Layer 2: ink-bleed dots in darker red around the contour
      ctx.fillStyle = POSTER_INK_DARK;
      const blotCount = 8;
      for (let i = 0; i < blotCount; i++) {
        const bx = wantedLeft + distressRng() * wantedW;
        const by = wantedTop + distressRng() * wantedH;
        const br = s(2 + distressRng() * 5);
        ctx.globalAlpha = 0.2 + distressRng() * 0.2;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }

      // Layer 3: irregular paper "dropout" — one larger parchment-colored
      // polygon punching through one letter, simulating where ink failed.
      ctx.fillStyle = POSTER_PAPER;
      ctx.globalAlpha = 0.5;
      const dropX = wantedLeft + wantedW * (0.25 + distressRng() * 0.5);
      const dropY = wantedTop + wantedH * (0.3 + distressRng() * 0.4);
      const dropR = s(12 + distressRng() * 8);
      ctx.beginPath();
      const dropPoints = 7 + Math.floor(distressRng() * 3);
      for (let i = 0; i < dropPoints; i++) {
        const angle = (i / dropPoints) * Math.PI * 2;
        const r = dropR * (0.5 + distressRng() * 0.7);
        const px = dropX + Math.cos(angle) * r;
        const py = dropY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      y += s(30);

      ctx.strokeStyle = POSTER_RED;
      ctx.lineWidth = s(5);
      ctx.beginPath();
      ctx.moveTo(centerX - s(340), y);
      ctx.lineTo(centerX + s(340), y);
      ctx.stroke();
      // Story format gets larger gaps in the top stack so WANTED + subtitle +
      // name don't feel crammed against each other on the taller 9:16 canvas.
      y += s(isStory ? 92 : 72);

      const subtitleText = selectedPosterSubtitle.toUpperCase();
      const subtitleFit = fitCanvasWrappedText(
        ctx,
        subtitleText,
        paperWidth - s(isStory ? 340 : 520),
        s(isStory ? 78 : 42),
        s(isStory ? 40 : 24),
        800,
        2,
      );
      const subtitleLineHeight = subtitleFit.fontSize * 1.2;
      ctx.fillStyle = POSTER_INK;
      ctx.font = `800 ${subtitleFit.fontSize}px 'Geist', sans-serif`;
      ctx.letterSpacing = `${s(4)}px`;
      subtitleFit.lines.forEach((line, index) => {
        ctx.fillText(line, centerX, y + index * subtitleLineHeight);
      });
      ctx.letterSpacing = "0px";
      y += s(isStory ? 150 : 68);

      // === Subject evidence photo ===
      // Sits between the subtitle and the name like a traditional wanted-
      // poster mugshot. The source PNG has a flat white background, so we
      // composite the figure onto the parchment with `multiply` blend mode:
      // white becomes the parchment colour, the navy silhouette stays
      // navy, and the result reads as if printed onto the page rather than
      // pasted on top. No frame is drawn so the figure flows into the
      // surrounding texture instead of feeling like a sticker.
      let photoBlockAdvance = 0;
      try {
        const photoImg = await loadPosterImage("/wanted-poster_picture.png");
        const photoAspect =
          photoImg.naturalWidth && photoImg.naturalHeight
            ? photoImg.naturalWidth / photoImg.naturalHeight
            : 1448 / 1086;
        const photoH = s(isStory ? 540 : 700);
        const photoW = photoH * photoAspect;
        const photoTopGap = s(isStory ? 28 : 20);
        const trailingGap = s(isStory ? 90 : 110);
        const photoX = centerX - photoW / 2;
        const photoY = y + photoTopGap;

        // No caption above the photo — the figure already carries its own
        // "NO CERTIFICATE ON FILE" stamp, and a separate label would just
        // weaken the WANTED → photo → name visual hierarchy.

        // The PNG has true transparency on its background, so a plain
        // drawImage composites the figure cleanly onto the parchment —
        // including the procedural paper grain showing through the
        // transparent areas, which is what we want.
        ctx.drawImage(photoImg, photoX, photoY, photoW, photoH);

        photoBlockAdvance = photoTopGap + photoH + trailingGap;
      } catch {
        // If the asset fails to load, the rest of the poster still renders.
      }
      y += photoBlockAdvance;

      ctx.fillStyle = POSTER_INK;
      let nameFontSize = s(isStory ? 122 : 104);
      ctx.font = `900 ${nameFontSize}px 'Geist', sans-serif`;
      while (
        ctx.measureText(displayName).width > paperWidth - s(isStory ? 140 : 200) &&
        nameFontSize > s(isStory ? 58 : 50)
      ) {
        nameFontSize -= s(4);
        ctx.font = `900 ${nameFontSize}px 'Geist', sans-serif`;
      }
      ctx.fillText(displayName, centerX, y);
      y += s(isStory ? 48 : 32);

      const nameWidth = Math.min(
        ctx.measureText(displayName).width + s(60),
        paperWidth - s(200),
      );
      ctx.strokeStyle = POSTER_GOLD;
      ctx.lineWidth = s(3);
      ctx.beginPath();
      ctx.moveTo(centerX - nameWidth / 2, y);
      ctx.lineTo(centerX + nameWidth / 2, y);
      ctx.stroke();
      y += s(isStory ? 82 : 64);

      // Typewriter-style fields row — replaces the old 3-column rounded boxes.
      // Reads as a filled-in paper form (label + value + dotted underline)
      // rather than a SaaS dashboard tile.
      const fieldsRowY = y;
      const fieldsTotalWidth = paperWidth - s(280);
      const fieldsX = marginX + s(140);
      const fieldGap = s(28);
      const fieldWidth = (fieldsTotalWidth - fieldGap * 2) / 3;
      const fields = [
        { label: t("caseStatusLabel"), value: t(`tones.${selectedTone}.caseStatus`) },
        { label: t("riskLevelLabel"), value: t(`tones.${selectedTone}.riskLevel`) },
        { label: t("recommendedActionLabel"), value: t(`tones.${selectedTone}.recommendedAction`) },
      ];
      fields.forEach((field, index) => {
        const x = fieldsX + index * (fieldWidth + fieldGap);
        ctx.fillStyle = POSTER_MUTED;
        ctx.font = `700 ${s(isStory ? 32 : 18)}px 'Geist', sans-serif`;
        ctx.textAlign = "center";
        ctx.letterSpacing = `${s(2.5)}px`;
        ctx.fillText(field.label.toUpperCase(), x + fieldWidth / 2, fieldsRowY);
        ctx.letterSpacing = "0px";
        ctx.fillStyle = POSTER_INK;
        ctx.font = `700 ${s(isStory ? 52 : 28)}px 'Courier New', 'Courier', monospace`;
        ctx.fillText(field.value, x + fieldWidth / 2, fieldsRowY + s(isStory ? 64 : 40));
        ctx.strokeStyle = POSTER_MUTED;
        ctx.lineWidth = s(1.5);
        ctx.setLineDash([s(4), s(4)]);
        ctx.beginPath();
        ctx.moveTo(x + s(12), fieldsRowY + s(isStory ? 86 : 54));
        ctx.lineTo(x + fieldWidth - s(12), fieldsRowY + s(isStory ? 86 : 54));
        ctx.stroke();
        ctx.setLineDash([]);
      });
      ctx.textAlign = "center";
      y = fieldsRowY + s(isStory ? 126 : 86);

      // Bottom-anchored layout — footer pulled clearly inside the inner
      // frame border (was sitting on top of it before). The QR CTA + footer
      // need extra breathing room on Story because their fonts are
      // significantly larger to remain phone-readable.
      const footerY = height - marginY - s(isStory ? 110 : 72);
      const qrCtaY = footerY - s(isStory ? 70 : 66);
      const qrAreaBottomY = qrCtaY - s(isStory ? 70 : 72);

      const qrY = qrAreaBottomY - qrSize;
      const caseDetailBoxWidth = Math.min(s(760), paperWidth - s(160));
      const caseDetailBoxHeight = s(isStory ? 0 : 116);
      const caseDetailBoxY = qrY - s(36) - caseDetailBoxHeight;

      const chargesBoxX = marginX + s(150);
      const chargesBoxWidth = paperWidth - s(300);
      const chargesBoxInnerX = chargesBoxX + s(48);
      const chargesBoxY = y;
      const maxChargeWidth = chargesBoxWidth - s(isStory ? 180 : 260);

      // Story canvas (1080 wide) gets downscaled to ~390 px on phone. To
      // keep charges readable post-downscale (target ~12 px on phone), we
      // need ~33 px on canvas → s(64). A4 print stays readable at s(34).
      const chargeTextSize = s(isStory ? 64 : 34);
      const chargeLineHeight = s(isStory ? 92 : 52);
      ctx.font = `500 ${chargeTextSize}px 'Geist', sans-serif`;
      const wrappedCharges = selectedCharges.map((charge, index) => {
        return { prefix: `${index + 1}.`, lines: wrapCanvasLines(ctx, charge, maxChargeWidth) };
      });

      // Charges box is sized to content (header + entries + breathing pad),
      // not stretched to fill the bottom region. Smaller box reads cleaner
      // and entries land at the top instead of floating in dead centre.
      const chargesEntryGap = s(isStory ? 56 : 46);
      const chargesContentHeight =
        wrappedCharges.reduce(
          (total, charge) => total + charge.lines.length * chargeLineHeight + chargesEntryGap,
          0,
        ) - chargesEntryGap;
      const chargesAvailable = caseDetailBoxY - chargesBoxY - s(isStory ? 36 : 72);
      const caseDetailText = selectedCaseDetail;
      const chargesHeaderHeight = s(isStory ? 112 : 80);
      const chargesBoxBottomPad = s(isStory ? 56 : 44);
      const desiredChargesBoxHeight = Math.max(
        s(280),
        chargesContentHeight + chargesHeaderHeight + chargesBoxBottomPad,
      );
      const chargesBoxHeight =
        chargesAvailable > s(360)
          ? Math.min(desiredChargesBoxHeight, chargesAvailable)
          : desiredChargesBoxHeight;

      ctx.strokeStyle = POSTER_MUTED;
      ctx.lineWidth = s(2);
      ctx.beginPath();
      ctx.roundRect(chargesBoxX, chargesBoxY, chargesBoxWidth, chargesBoxHeight, s(18));
      ctx.stroke();
      ctx.fillStyle = POSTER_RED;
      ctx.font = `700 ${s(isStory ? 60 : 40)}px 'Geist', sans-serif`;
      ctx.textAlign = "center";
      ctx.letterSpacing = `${s(4)}px`;
      ctx.fillText(t("chargesLabel").toUpperCase(), centerX, chargesBoxY + s(isStory ? 62 : 48));
      ctx.letterSpacing = "0px";
      ctx.textAlign = "left";
      ctx.fillStyle = POSTER_INK;
      ctx.font = `500 ${chargeTextSize}px 'Geist', sans-serif`;

      // Top-align entries — start just below the CHARGES header, with a
      // small constant offset. No vertical centering: per user feedback the
      // box should sit close to its content, not float in the middle.
      let chargesCursorY = chargesBoxY + chargesHeaderHeight + s(isStory ? 56 : 34);
      wrappedCharges.forEach((charge) => {
        ctx.font = `700 ${chargeTextSize}px 'Geist', sans-serif`;
        ctx.fillText(charge.prefix, chargesBoxInnerX, chargesCursorY);
        ctx.font = `500 ${chargeTextSize}px 'Geist', sans-serif`;

        charge.lines.forEach((currentLine, lineIndex) => {
          ctx.fillText(
            currentLine,
            chargesBoxInnerX + s(isStory ? 76 : 54),
            chargesCursorY + lineIndex * chargeLineHeight,
          );
        });

        chargesCursorY += charge.lines.length * chargeLineHeight + chargesEntryGap;
      });

      if (!isStory) {
        ctx.textAlign = "center";
        ctx.fillStyle = POSTER_GOLD;
        ctx.font = `700 ${s(28)}px 'Geist', sans-serif`;
        ctx.letterSpacing = `${s(3)}px`;
        ctx.fillText(
          t("caseDetailLabel").toUpperCase(),
          centerX,
          caseDetailBoxY + s(28),
        );
        ctx.letterSpacing = "0px";

        const caseDetailFit = fitCanvasWrappedText(
          ctx,
          caseDetailText,
          caseDetailBoxWidth - s(72),
          s(34),
          s(24),
          600,
          2,
        );
        const caseDetailLineHeight = caseDetailFit.fontSize * 1.2;
        ctx.fillStyle = POSTER_INK;
        ctx.font = `600 ${caseDetailFit.fontSize}px 'Geist', sans-serif`;
        caseDetailFit.lines.forEach((line, index) => {
          ctx.fillText(
            line,
            centerX,
            caseDetailBoxY + s(72) + index * caseDetailLineHeight,
          );
        });
      }

      // Note: the previous fake red "RESOLVE THIS CASE" button has been removed
      // — it was a non-functional pixel button on a static PNG that misled
      // viewers. The certificate seal has also been removed so the QR can
      // dominate the bottom area as the single, real, scannable call-to-action.

      // QR centered horizontally on the paper. Red border for high contrast,
      // and the URL routes to a personalized case page before the purchase
      // flow so scans continue the wanted-poster joke instead of acting as a
      // bare checkout CTA.
      const qrX = centerX - qrSize / 2;

      const trimmedName = name.trim();
      const shortCaseParams = new URLSearchParams({ t: selectedTone });
      if (trimmedName) shortCaseParams.set("n", trimmedName);
      const shortCasePath = `/w?${shortCaseParams.toString()}`;
      const caseUrlForQr =
        typeof window !== "undefined"
          ? buildAbsoluteLocalizedUrl(window.location.origin, locale, shortCasePath)
          : buildAbsoluteLocalizedUrl(
              process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com",
              locale,
              shortCasePath,
            );
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(qrX - s(14), qrY - s(14), qrSize + s(28), qrSize + s(28), s(12));
      ctx.fill();
      ctx.strokeStyle = POSTER_RED;
      ctx.lineWidth = s(4);
      ctx.beginPath();
      ctx.roundRect(qrX - s(14), qrY - s(14), qrSize + s(28), qrSize + s(28), s(12));
      ctx.stroke();
      drawQrCodeSafe(ctx, caseUrlForQr, qrX, qrY, qrSize);

      // Prominent QR call-to-action label — centered below QR. Bold red,
      // name-targeted, fitted to width.
      const qrCtaName = name.trim().split(/\s+/)[0]?.toUpperCase() ?? "";
      const qrCtaText =
        qrCtaName && qrCtaName.length <= 14
          ? t("qrCtaLabel", { name: qrCtaName })
          : t("qrCtaFallbackLabel");
      const qrCtaMaxWidth = paperWidth - s(160);
      const qrCtaFontSize = fitCanvasText(
        ctx,
        qrCtaText,
        qrCtaMaxWidth,
        s(isStory ? 74 : 42),
        s(isStory ? 44 : 24),
        800,
      );
      ctx.fillStyle = POSTER_RED;
      ctx.font = `800 ${qrCtaFontSize}px 'Geist', sans-serif`;
      ctx.textAlign = "center";
      ctx.letterSpacing = `${s(2)}px`;
      ctx.fillText(qrCtaText, centerX, qrCtaY);
      ctx.letterSpacing = "0px";

      ctx.fillStyle = POSTER_MUTED;
      ctx.font = `400 ${s(isStory ? 44 : 24)}px 'Geist', sans-serif`;
      ctx.fillText(t("posterFooter"), centerX, footerY);
    },
    [
      loadPosterImage,
      locale,
      name,
      posterFormat,
      selectedCaseDetail,
      selectedCharges,
      selectedPosterSubtitle,
      selectedTone,
      seededHash,
      t,
    ],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const layout = POSTER_LAYOUTS[posterFormat];
    canvas.width = layout.width;
    canvas.height = layout.height;

    drawPoster(ctx, layout).catch((error) => {
      console.error("[Wanted poster] Canvas render failed", error);
      // Leave the previous frame in place if drawing fails.
    });
  }, [drawPoster, posterFormat]);

  const handleGenerate = useCallback(() => {
    trackEvent("wanted_poster_generate", { name_length: name.trim().length });
    setGenerated(true);
  }, [name]);

  const createPosterExportBlob = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    if (!useTilt) {
      return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    }

    // The preview stays straight for editing. Exports get a deterministic
    // pinboard tilt; Story keeps 9:16 output and uses a subtler angle.
    const tiltOptions = posterFormat === "story" ? [-1, -0.65, 0.65, 1] : [-3, -2, 2, 3];
    const tiltDeg = tiltOptions[nameHash(`${name}::${posterFormat}`) % tiltOptions.length];
    const tiltRad = (tiltDeg * Math.PI) / 180;

    const srcW = canvas.width;
    const srcH = canvas.height;
    const cos = Math.abs(Math.cos(tiltRad));
    const sin = Math.abs(Math.sin(tiltRad));
    const rotatedW = srcW * cos + srcH * sin;
    const rotatedH = srcW * sin + srcH * cos;

    const off = document.createElement("canvas");
    off.width = posterFormat === "story" ? srcW : Math.ceil(rotatedW);
    off.height = posterFormat === "story" ? srcH : Math.ceil(rotatedH);
    const offCtx = off.getContext("2d");
    if (!offCtx) {
      return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    }

    offCtx.fillStyle = "#0e0a06";
    offCtx.fillRect(0, 0, off.width, off.height);
    offCtx.translate(off.width / 2, off.height / 2);
    offCtx.rotate(tiltRad);

    const tiltScale =
      posterFormat === "story"
        ? Math.min(srcW / rotatedW, srcH / rotatedH) * 0.985
        : 1;
    offCtx.scale(tiltScale, tiltScale);
    offCtx.drawImage(canvas, -srcW / 2, -srcH / 2);

    return new Promise<Blob | null>((resolve) => off.toBlob(resolve, "image/png"));
  }, [name, posterFormat, useTilt]);

  const handleDownload = useCallback(async () => {
    trackEvent("wanted_poster_download", { format: posterFormat, tilted: useTilt });
    setDownloading(true);
    try {
      const blob = await createPosterExportBlob();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = (name.trim() || "someone").replace(/\s+/g, "-").toLowerCase();
      link.href = url;
      link.download = `wanted-${safeName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }, [createPosterExportBlob, name, posterFormat, useTilt]);

  const handleShare = useCallback(async () => {
    trackEvent("wanted_poster_share", { format: posterFormat });
    const trimmedName = name.trim();
    const shortCaseParams = new URLSearchParams({ t: selectedTone });
    if (trimmedName) shortCaseParams.set("n", trimmedName);
    const shortCasePath = `/w?${shortCaseParams.toString()}`;
    const caseShareUrl =
      typeof window !== "undefined"
        ? buildAbsoluteLocalizedUrl(window.location.origin, locale, shortCasePath)
        : buildAbsoluteLocalizedUrl(
            process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com",
            locale,
            shortCasePath,
          );

    try {
      const blob = await createPosterExportBlob();
      if (!blob) return;

      const safeName = (name.trim() || "someone").replace(/\s+/g, "-").toLowerCase();
      const file = new File([blob], `wanted-${safeName}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: t("shareTitle", { name: name.trim() || t("defaultName") }),
          text: `${t("shareText", { name: name.trim() || t("defaultName") })}\n${caseShareUrl}`,
          url: caseShareUrl,
        });
      } else {
        await navigator.clipboard.writeText(caseShareUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(caseShareUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
      } catch {
        // Ignore clipboard failure.
      }
    }
  }, [createPosterExportBlob, locale, name, posterFormat, selectedTone, t]);

  const handleRegenerate = useCallback(() => {
    setGenerated(false);
    setRerollSeed(0);
    setName("");
  }, []);

  const handleReroll = useCallback(() => {
    trackEvent("wanted_poster_reroll");
    setRerollSeed((prev) => prev + 1);
    setLinkCopied(false);
  }, []);

  const updateName = useCallback((value: string) => {
    setGenerated(false);
    setLinkCopied(false);
    setRerollSeed(0);
    setName(value);
  }, []);

  const updateTone = useCallback((tone: WantedTone) => {
    setGenerated(false);
    setLinkCopied(false);
    setSelectedTone(tone);
  }, []);

  const updateFormat = useCallback((format: PosterFormat) => {
    setLinkCopied(false);
    setPosterFormat(format);
  }, []);

  const displayName = name.trim() || t("defaultName");
  const giftCtaText = t("giftCta", { name: displayName });
  const shortCaseUrl = `/w?${new URLSearchParams({
    t: selectedTone,
    ...(name.trim() ? { n: name.trim() } : {}),
  }).toString()}`;
  const giftUrl = `/purchase?tier=protected&gift=true&ref=wanted${
    name.trim() ? `&name=${encodeURIComponent(name.trim())}` : ""
  }`;
  const layout = POSTER_LAYOUTS[posterFormat];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <section
        data-reveal
        className="bg-gradient-to-b from-red-950/5 via-transparent to-transparent py-12 sm:py-14 lg:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-8">
            <div className="lg:max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-700">
                {t("label")}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
                {t("title")}
              </h1>
              <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
                {t("subtitle")}
              </p>
              {/* Synthetic social proof badge — small starter number ("18")
                  while the site has no real traffic; bump manually until we
                  switch to real analytics-derived counts. */}
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50/70 px-3 py-1.5 text-xs font-semibold text-red-700">
                <span aria-hidden="true">●</span>
                {t("socialProofText")}
              </p>

              <div className="mt-6 rounded-[28px] border border-red-100 bg-gradient-to-br from-red-50/70 via-white to-white p-6 shadow-sm sm:p-7">
                <div className="border-b border-red-100 pb-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-red-700">
                    {t("formTitle")}
                  </p>
                  <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                    {t("formSubtitle")}
                  </p>
                </div>

                <form
                  className="mt-4 space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (name.trim()) handleGenerate();
                  }}
                >
                  <div>
                    <label
                      htmlFor="wanted-name"
                      className="mb-2 block text-sm font-semibold text-[var(--brand-dark)]"
                    >
                      {t("nameLabel")}
                    </label>
                    <input
                      id="wanted-name"
                      name="wanted_name"
                      type="text"
                      autoComplete="name"
                      autoCorrect="off"
                      autoCapitalize="words"
                      spellCheck={false}
                      value={name}
                      onChange={(event) => updateName(event.target.value)}
                      placeholder={t("namePlaceholder")}
                      className="w-full rounded-xl border border-red-200 bg-white px-5 py-4 text-base text-[var(--brand-dark)] shadow-sm placeholder:text-[var(--muted)]/50 transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/15"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[t("suggestion1"), t("suggestion2"), t("suggestion3")].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => updateName(suggestion)}
                        className="rounded-lg border border-red-100 bg-red-50/50 px-4 py-1.5 text-xs font-medium text-red-700 transition-colors duration-300 ease-out hover:bg-red-100"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  <fieldset className="space-y-2">
                    <legend className="text-sm font-semibold text-[var(--brand-dark)]">
                      {t("toneLabel")}
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {WANTED_TONES.map((tone) => {
                        const isSelected = selectedTone === tone;
                        return (
                          <button
                            key={tone}
                            type="button"
                            onClick={() => updateTone(tone)}
                            aria-pressed={isSelected}
                            className={`rounded-xl border px-3 py-3 text-left transition-colors duration-300 ease-out ${
                              isSelected
                                ? "border-red-300 bg-red-50 text-red-800 shadow-sm"
                                : "border-[var(--border)] bg-white text-[var(--muted)] hover:bg-red-50/50"
                            }`}
                          >
                            <span className="block text-sm font-semibold text-[var(--brand-dark)]">
                              {t(`tones.${tone}.label`)}
                            </span>
                            <span className="mt-1 block text-xs leading-5">
                              {t(`tones.${tone}.description`)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <button
                    type="submit"
                    disabled={!name.trim()}
                    className="hidden min-h-[52px] w-full rounded-lg bg-red-600 px-6 py-4 text-base font-bold text-white transition-colors duration-300 ease-out hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 lg:block"
                  >
                    {t("generateButton")}
                  </button>
                </form>

                <p className="mt-4 text-xs leading-6 text-[var(--muted)]">
                  {t("formDisclaimer")}
                </p>
              </div>
            </div>

            <div className="lg:sticky lg:top-28">
              <div className="rounded-[28px] border border-amber-900/15 bg-white p-4 shadow-sm sm:p-5">
                <div className="border-b border-[var(--border)] pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--section-label)]">
                      {t("previewLabel")}
                    </span>
                    <span className="truncate text-xs font-medium text-[var(--muted)]">
                      {displayName}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                    {generated ? t("previewHintAfterGenerate") : t("previewHintBeforeGenerate")}
                  </p>
                </div>

                <div
                  className={`mt-4 overflow-hidden rounded-xl border border-amber-900/20 bg-[#140900] shadow-sm ${
                    posterFormat === "story" ? "mx-auto max-w-[380px]" : ""
                  }`}
                >
                  <canvas
                    ref={canvasRef}
                    className="h-auto w-full"
                    style={{ aspectRatio: layout.aspectRatio }}
                  />
                </div>

                {/* Format and reroll controls apply to the live preview before generation. */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    {t("formatLabel")}
                  </span>
                  <div className="inline-flex rounded-lg border border-[var(--border)] bg-white p-0.5">
                    {POSTER_FORMATS.map((format) => {
                      const isSelected = posterFormat === format;
                      return (
                        <button
                          key={format}
                          type="button"
                          onClick={() => updateFormat(format)}
                          aria-pressed={isSelected}
                          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ease-out ${
                            isSelected
                              ? "bg-red-600 text-white shadow-sm"
                              : "bg-transparent text-[var(--muted)] hover:bg-red-50"
                          }`}
                        >
                          {format === "a4" ? t("formatA4") : t("formatStory")}
                        </button>
                      );
                    })}
                  </div>

                  <label className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--muted)]">
                    <input
                      type="checkbox"
                      checked={useTilt}
                      onChange={(event) => setUseTilt(event.target.checked)}
                      className="h-3.5 w-3.5 rounded border-[var(--border)] accent-red-600"
                    />
                    {t("tiltToggleLabel")}
                  </label>

                  <button
                    type="button"
                    onClick={handleReroll}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--brand-dark)] transition-colors duration-200 ease-out hover:bg-red-50"
                    aria-label={t("rerollChargesButton")}
                  >
                    <span aria-hidden="true">🎲</span>
                    {t("rerollChargesButton")}
                  </button>
                </div>

                {!generated ? (
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={!name.trim()}
                    className="mt-3 min-h-[52px] w-full rounded-lg bg-red-600 px-6 py-4 text-base font-bold text-white transition-colors duration-300 ease-out hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 lg:hidden"
                  >
                    {t("generateButton")}
                  </button>
                ) : null}

                <div className="mt-4 space-y-3">
                  {generated ? (
                    <>
                      <LocalizedLink
                        href={giftUrl}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] px-5 py-3 text-center text-sm font-semibold leading-6 text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:whitespace-nowrap"
                      >
                        <span>{giftCtaText}</span>
                      </LocalizedLink>
                      <p className="text-center text-xs leading-5 text-[var(--muted)]">
                        {t("priceAnchor")}
                      </p>

                      <button
                        onClick={handleShare}
                        className={`w-full rounded-lg border px-4 py-3.5 text-sm font-semibold transition-colors duration-300 ease-out ${
                          linkCopied
                            ? "border-teal-300 bg-teal-50 text-teal-700"
                            : "border-red-300 bg-white text-red-700 hover:bg-red-50"
                        }`}
                      >
                        {linkCopied ? t("linkCopied") : t("shareButton")}
                      </button>

                      <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--muted)] transition-colors duration-300 ease-out hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {downloading ? t("downloadingButton") : t("downloadButton")}
                      </button>

                      <button
                        onClick={handleRegenerate}
                        className="w-full text-center text-sm font-medium text-[var(--muted)] transition hover:text-[var(--brand-dark)]"
                      >
                        {t("newPoster")}
                      </button>

                      <LocalizedLink
                        href={shortCaseUrl}
                        className="block rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-center text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-red-50"
                      >
                        <span>{t("caseLinkLabel")}</span>
                        <span className="mt-0.5 block text-xs font-medium leading-5 text-[var(--muted)]">
                          {t("caseLinkDescription")}
                        </span>
                      </LocalizedLink>
                    </>
                  ) : (
                    <p className="text-xs leading-6 text-[var(--muted)]">
                      {t("viralPrompt")} {t("viralSubtext")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-reveal className="bg-[#25527f] pb-16 pt-14 sm:pt-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t("footerCtaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-white/95">
              {t("footerCtaText")}
            </p>
            <div className="mt-8 flex justify-center">
              <LocalizedLink
                href="/purchase?tier=protected&gift=true&ref=wanted"
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-4 text-base font-bold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:w-auto sm:px-8 sm:text-lg"
              >
                {t("footerCtaButton")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
