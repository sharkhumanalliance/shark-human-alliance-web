"use client";

import { useTranslations } from "next-intl";
import { useState, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

/* ── helpers ────────────────────────────────────────────── */

function nameHash(name: string): number {
  let h = 0;
  const s = name || "default";
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/* ── poster palette ─────────────────────────────────────── */

const POSTER_BG = "#1a0a00";
const POSTER_PAPER = "#f5e6c8";
const POSTER_INK = "#2a1a0a";
const POSTER_RED = "#c0392b";
const POSTER_GOLD = "#d4a017";
const POSTER_MUTED = "#8b7355";

/* ── main component ─────────────────────────────────────── */

export function WantedContent() {
  const t = useTranslations("wanted");
  const [name, setName] = useState("");
  const [generated, setGenerated] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sealImgRef = useRef<HTMLImageElement | null>(null);

  // Read charges from translations (pool of funny reasons)
  const charges = useMemo(() => {
    const arr: string[] = [];
    for (let i = 0; i < 12; i++) {
      try {
        const v = t(`charges.${i}`);
        if (v) arr.push(v);
      } catch {
        break;
      }
    }
    return arr;
  }, [t]);

  // Pick 3 deterministic charges based on name
  const selectedCharges = useMemo(() => {
    if (charges.length === 0) return [];
    const h = nameHash(name);
    const picked: string[] = [];
    const pool = [...charges];
    for (let i = 0; i < Math.min(3, pool.length); i++) {
      const idx = (h + i * 7) % pool.length;
      picked.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return picked;
  }, [name, charges]);

  // Preload seal image
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
      img.src = "/seal.png";
    });
  }, []);

  /* ── Canvas drawing (9:16 = 1080×1920) ────────────── */

  const drawPoster = useCallback(
    async (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const displayName = name.trim() || t("defaultName");

      // Background
      ctx.fillStyle = POSTER_BG;
      ctx.fillRect(0, 0, w, h);

      // Paper area with rough edges feel
      const mx = 60, my = 80;
      const pw = w - mx * 2, ph = h - my * 2;
      ctx.fillStyle = POSTER_PAPER;
      ctx.beginPath();
      ctx.roundRect(mx, my, pw, ph, 12);
      ctx.fill();

      // Inner border (double line effect)
      ctx.strokeStyle = POSTER_MUTED;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(mx + 20, my + 20, pw - 40, ph - 40, 8);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(mx + 26, my + 26, pw - 52, ph - 52, 6);
      ctx.stroke();

      let y = my + 80;
      const cx = w / 2;

      // "SHARK HUMAN ALLIANCE" header
      ctx.fillStyle = POSTER_MUTED;
      ctx.font = "600 22px 'Geist', sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "6px";
      ctx.fillText(t("posterHeader").toUpperCase(), cx, y);
      ctx.letterSpacing = "0px";
      y += 60;

      // "WANTED" — big bold
      ctx.fillStyle = POSTER_RED;
      ctx.font = "900 120px 'Geist', sans-serif";
      ctx.fillText(t("wantedTitle"), cx, y);
      y += 20;

      // Decorative line
      ctx.strokeStyle = POSTER_RED;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 200, y);
      ctx.lineTo(cx + 200, y);
      ctx.stroke();
      y += 50;

      // Subtitle
      ctx.fillStyle = POSTER_INK;
      ctx.font = "600 28px 'Geist', sans-serif";
      ctx.letterSpacing = "4px";
      ctx.fillText(t("wantedSubtitle").toUpperCase(), cx, y);
      ctx.letterSpacing = "0px";
      y += 70;

      // Seal image (circular area)
      try {
        const sealImg = await ensureSealLoaded();
        const sealSize = 260;
        // Circle clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, y + sealSize / 2, sealSize / 2 + 10, 0, Math.PI * 2);
        ctx.fillStyle = "#e8d5b0";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, y + sealSize / 2, sealSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(sealImg, cx - sealSize / 2, y, sealSize, sealSize);
        ctx.restore();
        // Ring around seal
        ctx.strokeStyle = POSTER_GOLD;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, y + sealSize / 2, sealSize / 2 + 10, 0, Math.PI * 2);
        ctx.stroke();
        y += sealSize + 50;
      } catch {
        y += 40;
      }

      // NAME — large display
      ctx.fillStyle = POSTER_INK;
      ctx.font = "900 64px 'Geist', sans-serif";
      // Truncate if too wide
      let fontSize = 64;
      while (ctx.measureText(displayName).width > pw - 120 && fontSize > 32) {
        fontSize -= 2;
        ctx.font = `900 ${fontSize}px 'Geist', sans-serif`;
      }
      ctx.fillText(displayName, cx, y);
      y += 16;
      // Underline
      const nameW = Math.min(ctx.measureText(displayName).width + 40, pw - 120);
      ctx.strokeStyle = POSTER_GOLD;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - nameW / 2, y);
      ctx.lineTo(cx + nameW / 2, y);
      ctx.stroke();
      y += 55;

      // "CHARGES:" label
      ctx.fillStyle = POSTER_RED;
      ctx.font = "700 24px 'Geist', sans-serif";
      ctx.letterSpacing = "3px";
      ctx.fillText(t("chargesLabel").toUpperCase(), cx, y);
      ctx.letterSpacing = "0px";
      y += 40;

      // Charges list
      ctx.fillStyle = POSTER_INK;
      ctx.font = "500 22px 'Geist', sans-serif";
      ctx.textAlign = "center";
      for (const charge of selectedCharges) {
        // Wrap long charges
        const words = charge.split(" ");
        let line = "";
        const lines: string[] = [];
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > pw - 160) {
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        }
        if (line) lines.push(line);
        for (const l of lines) {
          ctx.fillText(`${l}`, cx, y);
          y += 32;
        }
        y += 8;
      }
      y += 20;

      // Reward section
      ctx.fillStyle = POSTER_GOLD;
      ctx.font = "700 22px 'Geist', sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText(t("rewardLabel").toUpperCase(), cx, y);
      ctx.letterSpacing = "0px";
      y += 36;

      ctx.fillStyle = POSTER_INK;
      ctx.font = "600 26px 'Geist', sans-serif";
      ctx.fillText(t("rewardText"), cx, y);
      y += 70;

      // Footer CTA
      // Rounded rect button
      const btnW = 600, btnH = 70;
      const btnX = cx - btnW / 2, btnY = y - 10;
      ctx.fillStyle = POSTER_RED;
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 35);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 26px 'Geist', sans-serif";
      ctx.fillText(t("ctaButton"), cx, btnY + btnH / 2 + 9);
      y += btnH + 40;

      // Alliance branding at bottom
      ctx.fillStyle = POSTER_MUTED;
      ctx.font = "400 18px 'Geist', sans-serif";
      ctx.fillText(t("posterFooter"), cx, h - my - 50);
    },
    [name, selectedCharges, t, ensureSealLoaded]
  );

  const handleGenerate = useCallback(async () => {
    setGenerated(true);
    // Small delay to ensure canvas is mounted
    await new Promise((r) => setTimeout(r, 100));
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 1080;
    canvas.height = 1920;
    await drawPoster(ctx, 1080, 1920);
  }, [drawPoster]);

  const handleDownload = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (name.trim() || "someone").replace(/\s+/g, "-").toLowerCase();
      a.download = `wanted-${safeName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }, [name]);

  const handleShare = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
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
        // Fallback: download
        handleDownload();
      }
    } catch {
      // User cancelled share or error
    }
  }, [name, t, handleDownload]);

  const handleRegenerate = useCallback(() => {
    setGenerated(false);
    setName("");
  }, []);

  const giftUrl = `/purchase?tier=protected&gift=true${name.trim() ? `&name=${encodeURIComponent(name.trim())}` : ""}`;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <section className="py-14 bg-gradient-to-b from-red-950/5 to-transparent">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-700">
            {t("label")}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Generator */}
      <section className="pb-14">
        <div className="mx-auto max-w-xl px-6">
          {!generated ? (
            /* ── Form state ──────────────────────────── */
            <div className="rounded-[2rem] border border-red-100 bg-white p-8 shadow-[0_16px_50px_rgba(25,87,138,0.08)]">
              <div className="text-center mb-6">
                <span className="text-5xl">🚨</span>
                <h2 className="mt-4 text-2xl font-bold text-[var(--brand-dark)]">
                  {t("formTitle")}
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {t("formSubtitle")}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="wanted-name"
                    className="block text-sm font-semibold text-[var(--brand-dark)] mb-2"
                  >
                    {t("nameLabel")}
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border-2 border-red-200 bg-white px-5 py-4 transition focus-within:border-red-400 focus-within:shadow-[0_8px_30px_rgba(192,57,43,0.1)]">
                    <span className="text-lg" aria-hidden="true">🔍</span>
                    <input
                      id="wanted-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("namePlaceholder")}
                      className="w-full bg-transparent text-base text-[var(--brand-dark)] placeholder:text-[var(--muted)]/50 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && name.trim()) handleGenerate();
                      }}
                    />
                  </div>
                </div>

                {/* Suggestion chips */}
                <div className="flex flex-wrap gap-2">
                  {[t("suggestion1"), t("suggestion2"), t("suggestion3")].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setName(s)}
                      className="rounded-full border border-red-100 bg-red-50/50 px-4 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!name.trim()}
                  className="mt-4 w-full rounded-full bg-red-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-red-200/50 transition hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t("generateButton")}
                </button>
              </div>

              <p className="mt-6 text-center text-xs text-[var(--muted)]">
                {t("formDisclaimer")}
              </p>
            </div>
          ) : (
            /* ── Result state ─────────────────────────── */
            <div className="space-y-6">
              {/* Canvas poster preview */}
              <div className="rounded-[2rem] overflow-hidden shadow-2xl border-2 border-amber-900/20">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto"
                  style={{ aspectRatio: "9/16" }}
                />
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full rounded-full bg-[var(--brand-dark)] px-6 py-4 text-base font-bold text-white shadow-lg transition hover:bg-[var(--brand-dark)]/90 disabled:opacity-60"
                >
                  {downloading ? t("downloadingButton") : t("downloadButton")}
                </button>

                <button
                  onClick={handleShare}
                  className="w-full rounded-full border-2 border-[var(--brand-dark)] bg-white px-6 py-4 text-base font-bold text-[var(--brand-dark)] transition hover:bg-sky-50"
                >
                  {t("shareButton")}
                </button>

                <Link
                  href={giftUrl}
                  className="block w-full rounded-full bg-red-600 px-6 py-4 text-center text-base font-bold text-white shadow-lg shadow-red-200/50 transition hover:bg-red-700"
                >
                  🛡️ {t("giftCta", { name: name.trim() || t("defaultName") })}
                </Link>

                <button
                  onClick={handleRegenerate}
                  className="w-full text-center text-sm font-medium text-[var(--muted)] transition hover:text-[var(--brand-dark)]"
                >
                  {t("newPoster")}
                </button>
              </div>

              {/* Viral sharing prompt */}
              <div className="rounded-[2rem] border border-orange-100 bg-orange-50/50 p-6 text-center">
                <p className="text-sm font-semibold text-orange-800">
                  {t("viralPrompt")}
                </p>
                <p className="mt-2 text-xs text-orange-600">
                  {t("viralSubtext")}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How it works strip */}
      <section className="border-t border-sky-100 bg-white py-14">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-[var(--brand-dark)]">
            {t("howTitle")}
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
                  {t(`howStep${i}Icon`)}
                </span>
                <h3 className="text-lg font-semibold text-[var(--brand-dark)]">
                  {t(`howStep${i}Title`)}
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  {t(`howStep${i}Text`)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link
              href="/purchase?tier=protected&gift=true"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-orange-200/50 transition hover:bg-[var(--accent-dark)]"
            >
              🎁 {t("bottomCta")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
