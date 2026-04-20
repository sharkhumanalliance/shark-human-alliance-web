"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { LocalizedLink } from "@/components/ui/localized-link";
import { trackEvent } from "@/components/analytics";
import { getQrCodeUrl } from "@/lib/qr-svg";
import { buildAbsoluteLocalizedUrl } from "@/lib/navigation";

function nameHash(name: string): number {
  let hash = 0;
  const source = name || "default";
  for (let i = 0; i < source.length; i++) {
    hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const POSTER_BG = "#1a0a00";
const POSTER_PAPER = "#f5e6c8";
const POSTER_INK = "#2a1a0a";
const POSTER_RED = "#c0392b";
const POSTER_GOLD = "#d4a017";
const POSTER_MUTED = "#8b7355";

export function WantedContent() {
  const t = useTranslations("wanted");
  const locale = useLocale();
  const [name, setName] = useState("");
  const [generated, setGenerated] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sealImgRef = useRef<HTMLImageElement | null>(null);

  const charges = useMemo(() => {
    const values: string[] = [];
    for (let i = 0; i < 12; i++) {
      try {
        const value = t(`charges.${i}`);
        if (value) values.push(value);
      } catch {
        break;
      }
    }
    return values;
  }, [t]);

  const selectedCharges = useMemo(() => {
    if (charges.length === 0) return [];
    const hash = nameHash(name);
    const picked: string[] = [];
    const pool = [...charges];

    for (let i = 0; i < Math.min(3, pool.length); i++) {
      const index = (hash + i * 7) % pool.length;
      picked.push(pool[index]);
      pool.splice(index, 1);
    }

    return picked;
  }, [name, charges]);

  const ensureSealLoaded = useCallback((): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      if (sealImgRef.current) {
        resolve(sealImgRef.current);
        return;
      }

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        sealImgRef.current = img;
        resolve(img);
      };
      img.onerror = reject;
      img.src = "/cert-seal.png";
    });
  }, []);

  const loadQrImage = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = getQrCodeUrl(url, 300);
    });
  }, []);

  const drawPoster = useCallback(
    async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const displayName = name.trim() || t("defaultName");

      ctx.fillStyle = POSTER_BG;
      ctx.fillRect(0, 0, width, height);

      const marginX = 120;
      const marginY = 140;
      const paperWidth = width - marginX * 2;
      const paperHeight = height - marginY * 2;

      ctx.fillStyle = POSTER_PAPER;
      ctx.beginPath();
      ctx.roundRect(marginX, marginY, paperWidth, paperHeight, 16);
      ctx.fill();

      ctx.strokeStyle = POSTER_MUTED;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(marginX + 36, marginY + 36, paperWidth - 72, paperHeight - 72, 10);
      ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(marginX + 46, marginY + 46, paperWidth - 92, paperHeight - 92, 8);
      ctx.stroke();

      let y = marginY + 110;
      const centerX = width / 2;
      const caseNumber = `SHA-${nameHash(displayName).toString().slice(-4).padStart(4, "0")}`;

      ctx.fillStyle = POSTER_MUTED;
      ctx.font = "600 32px 'Geist', sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "12px";
      ctx.fillText(t("posterHeader").toUpperCase(), centerX, y);
      ctx.letterSpacing = "0px";
      y += 54;

      ctx.strokeStyle = POSTER_MUTED;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX - 260, y);
      ctx.lineTo(centerX + 260, y);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillStyle = POSTER_MUTED;
      ctx.font = "600 22px 'Geist', sans-serif";
      ctx.fillText(caseNumber, marginX + paperWidth - 92, y - 18);
      ctx.textAlign = "center";
      y += 124;

      ctx.fillStyle = POSTER_RED;
      ctx.font = "900 200px 'Geist', sans-serif";
      ctx.fillText(t("wantedTitle"), centerX, y);
      y += 30;

      ctx.strokeStyle = POSTER_RED;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(centerX - 340, y);
      ctx.lineTo(centerX + 340, y);
      ctx.stroke();
      y += 72;

      ctx.fillStyle = POSTER_INK;
      ctx.font = "600 34px 'Geist', sans-serif";
      ctx.letterSpacing = "6px";
      ctx.fillText(t("wantedSubtitle").toUpperCase(), centerX, y);
      ctx.letterSpacing = "0px";
      y += 88;

      ctx.fillStyle = POSTER_INK;
      ctx.font = "900 96px 'Geist', sans-serif";
      let fontSize = 96;
      while (ctx.measureText(displayName).width > paperWidth - 200 && fontSize > 48) {
        fontSize -= 4;
        ctx.font = `900 ${fontSize}px 'Geist', sans-serif`;
      }
      ctx.fillText(displayName, centerX, y);
      y += 28;

      const nameWidth = Math.min(ctx.measureText(displayName).width + 60, paperWidth - 200);
      ctx.strokeStyle = POSTER_GOLD;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - nameWidth / 2, y);
      ctx.lineTo(centerX + nameWidth / 2, y);
      ctx.stroke();
      y += 84;

      const chargesBoxX = marginX + 150;
      const chargesBoxWidth = paperWidth - 300;
      const chargesBoxInnerX = chargesBoxX + 48;
      const chargesBoxY = y;
      const maxChargeWidth = chargesBoxWidth - 150;
      ctx.font = "500 30px 'Geist', sans-serif";
      const wrappedCharges = selectedCharges.map((charge, index) => {
        const words = charge.split(" ");
        const lines: string[] = [];
        let line = "";

        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > maxChargeWidth) {
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        }

        if (line) lines.push(line);

        return {
          prefix: `${index + 1}.`,
          lines,
        };
      });

      const rewardBoxWidth = 760;
      const rewardBoxHeight = 112;
      const rewardBoxX = centerX - rewardBoxWidth / 2;
      const rewardBoxY = height - marginY - 640;
      const buttonWidth = 900;
      const buttonHeight = 84;
      const buttonX = centerX - buttonWidth / 2;
      const buttonY = rewardBoxY + rewardBoxHeight + 26;
      const sealSize = 228;
      const qrSize = 176;
      const bottomY = height - marginY - 260;

      const chargesContentHeight =
        98 +
        wrappedCharges.reduce(
          (total, charge) => total + charge.lines.length * 46 + 34,
          0,
        ) -
        34;
      const chargesBoxHeight = Math.max(
        280,
        Math.min(chargesContentHeight + 26, rewardBoxY - chargesBoxY - 36),
      );
      ctx.strokeStyle = POSTER_MUTED;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(chargesBoxX, chargesBoxY, chargesBoxWidth, chargesBoxHeight, 18);
      ctx.stroke();
      ctx.fillStyle = POSTER_RED;
      ctx.font = "700 34px 'Geist', sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "4px";
      ctx.fillText(t("chargesLabel").toUpperCase(), centerX, chargesBoxY + 42);
      ctx.letterSpacing = "0px";
      ctx.textAlign = "left";
      ctx.fillStyle = POSTER_INK;
      ctx.font = "500 30px 'Geist', sans-serif";

      let chargesCursorY = chargesBoxY + 108;
      wrappedCharges.forEach((charge) => {
        ctx.font = "700 30px 'Geist', sans-serif";
        ctx.fillText(charge.prefix, chargesBoxInnerX, chargesCursorY);
        ctx.font = "500 30px 'Geist', sans-serif";

        charge.lines.forEach((currentLine, lineIndex) => {
          ctx.fillText(
            currentLine,
            chargesBoxInnerX + 54,
            chargesCursorY + lineIndex * 46,
          );
        });

        chargesCursorY += charge.lines.length * 46 + 42;
      });

      ctx.strokeStyle = POSTER_GOLD;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(rewardBoxX, rewardBoxY, rewardBoxWidth, rewardBoxHeight, 18);
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = POSTER_GOLD;
      ctx.font = "700 28px 'Geist', sans-serif";
      ctx.letterSpacing = "3px";
      ctx.fillText(t("rewardLabel").toUpperCase(), centerX, rewardBoxY + 34);
      ctx.letterSpacing = "0px";

      ctx.fillStyle = POSTER_INK;
      ctx.font = "600 34px 'Geist', sans-serif";
      ctx.fillText(t("rewardText"), centerX, rewardBoxY + 74);

      ctx.fillStyle = POSTER_RED;
      ctx.beginPath();
      ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 44);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 36px 'Geist', sans-serif";
      ctx.fillText(t("ctaButton"), centerX, buttonY + buttonHeight / 2 + 11);

      try {
        const sealImg = await ensureSealLoaded();
        const sealX = marginX + paperWidth - 60 - sealSize;
        const sealCenterY = bottomY + sealSize / 2;
        ctx.save();
        ctx.beginPath();
        ctx.arc(sealX + sealSize / 2, sealCenterY, sealSize / 2 + 10, 0, Math.PI * 2);
        ctx.fillStyle = "#e8d5b0";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sealX + sealSize / 2, sealCenterY, sealSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(sealImg, sealX, bottomY, sealSize, sealSize);
        ctx.restore();
        ctx.strokeStyle = POSTER_GOLD;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(sealX + sealSize / 2, sealCenterY, sealSize / 2 + 10, 0, Math.PI * 2);
        ctx.stroke();
      } catch {
        // Skip seal if it fails to load.
      }

      const purchaseUrl =
        typeof window !== "undefined"
          ? buildAbsoluteLocalizedUrl(window.location.origin, locale, "/verify?id=sample")
          : buildAbsoluteLocalizedUrl(process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com", locale, "/verify?id=sample");

      try {
        const qrImg = await loadQrImage(purchaseUrl);
        const qrX = marginX + 60;
        const qrY = bottomY + (sealSize - qrSize) / 2;

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 10);
        ctx.fill();
        ctx.strokeStyle = POSTER_MUTED;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 10);
        ctx.stroke();
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

        ctx.fillStyle = POSTER_MUTED;
        ctx.font = "500 22px 'Geist', sans-serif";
        ctx.fillText(t("qrLabel"), qrX + qrSize / 2, qrY + qrSize + 36);
      } catch {
        // Skip QR if it fails to load.
      }

      ctx.fillStyle = POSTER_MUTED;
      ctx.font = "400 24px 'Geist', sans-serif";
      ctx.fillText(t("posterFooter"), centerX, bottomY + sealSize + 74);
    },
    [ensureSealLoaded, loadQrImage, locale, name, selectedCharges, t],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 2100;
    canvas.height = 2970;

    drawPoster(ctx, 2100, 2970).catch(() => {
      // Leave the previous frame in place if drawing fails.
    });
  }, [drawPoster]);

  const handleGenerate = useCallback(() => {
    trackEvent("wanted_poster_generate", { name_length: name.trim().length });
    setGenerated(true);
  }, [name]);

  const handleDownload = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    trackEvent("wanted_poster_download");
    setDownloading(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
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
  }, [name]);

  const handleShare = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    trackEvent("wanted_poster_share");
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) return;

      const safeName = (name.trim() || "someone").replace(/\s+/g, "-").toLowerCase();
      const file = new File([blob], `wanted-${safeName}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: t("shareTitle"),
          text: t("shareText", { name: name.trim() || t("defaultName") }),
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
      } catch {
        // Ignore clipboard failure.
      }
    }
  }, [name, t]);

  const handleRegenerate = useCallback(() => {
    setGenerated(false);
    setName("");
  }, []);

  const updateName = useCallback((value: string) => {
    setGenerated(false);
    setLinkCopied(false);
    setName(value);
  }, []);

  const displayName = name.trim() || t("defaultName");
  const giftUrl = `/purchase?tier=protected&gift=true${
    name.trim() ? `&name=${encodeURIComponent(name.trim())}` : ""
  }`;

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

                  <button
                    type="submit"
                    disabled={!name.trim()}
                    className="min-h-[52px] w-full rounded-lg bg-red-600 px-6 py-4 text-base font-bold text-white transition-colors duration-300 ease-out hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
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

                <div className="mt-4 overflow-hidden rounded-xl border border-amber-900/20 bg-[#140900] shadow-sm">
                  <canvas
                    ref={canvasRef}
                    className="h-auto w-full"
                    style={{ aspectRatio: "210 / 297" }}
                  />
                </div>

                <div className="mt-3 space-y-3">
                  {generated ? (
                    <LocalizedLink
                      href={giftUrl}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-4 text-center text-base font-bold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)]"
                    >
                      {t("giftCta", { name: displayName })}
                    </LocalizedLink>
                  ) : null}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleDownload}
                      disabled={!generated || downloading}
                      className="rounded-lg border border-[var(--border)] bg-white px-4 py-3.5 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {downloading ? t("downloadingButton") : t("downloadButton")}
                    </button>

                    <button
                      onClick={handleShare}
                      disabled={!generated}
                      className={`rounded-lg border px-4 py-3.5 text-sm font-semibold transition-colors duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-60 ${
                        linkCopied
                          ? "border-teal-300 bg-teal-50 text-teal-700"
                          : "border-[var(--border)] bg-white text-[var(--brand-dark)] hover:bg-gray-50"
                      }`}
                    >
                      {linkCopied ? t("linkCopied") : t("shareButton")}
                    </button>
                  </div>

                  <p className="text-xs leading-6 text-[var(--muted)]">
                    {t("viralPrompt")} {t("viralSubtext")}
                  </p>

                  {generated ? (
                    <button
                      onClick={handleRegenerate}
                      className="w-full text-center text-sm font-medium text-[var(--muted)] transition hover:text-[var(--brand-dark)]"
                    >
                      {t("newPoster")}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-reveal className="py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border)] px-6 py-5 sm:px-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--section-label)]">
                {t("howTitle")}
              </p>
            </div>
            <div className="grid gap-0 md:grid-cols-3">
              {[1, 2, 3].map((i, index) => (
                <article
                  key={i}
                  className={`px-6 py-6 sm:px-8 ${
                    index > 0 ? "border-t border-[var(--border)] md:border-l md:border-t-0" : ""
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--section-label)]">
                    0{i}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-[var(--brand-dark)]">
                    {t(`howStep${i}Title`)}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {t(`howStep${i}Text`)}
                  </p>
                </article>
              ))}
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
                href="/purchase?tier=protected&gift=true"
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
