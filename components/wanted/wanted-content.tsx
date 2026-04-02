"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { LocalizedLink } from "@/components/ui/localized-link";
import { trackEvent } from "@/components/analytics";
import { getQrCodeUrl } from "@/lib/qr-svg";
import { buildAbsoluteLocalizedUrl } from "@/lib/navigation";

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
  const locale = useLocale();
  const [name, setName] = useState("");
  const [generated, setGenerated] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
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
      img.src = "/cert-seal.png";
    });
  }, []);

  // Load QR code image from external API
  const loadQrImage = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = getQrCodeUrl(url, 300);
    });
  }, []);

  /* ── Canvas drawing (A4 portrait = 2100×2970) ────── */

  const drawPoster = useCallback(
    async (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const displayName = name.trim() || t("defaultName");

      // Background
      ctx.fillStyle = POSTER_BG;
      ctx.fillRect(0, 0, w, h);

      // Paper area
      const mx = 120, my = 140;
      const pw = w - mx * 2, ph = h - my * 2;
      ctx.fillStyle = POSTER_PAPER;
      ctx.beginPath();
      ctx.roundRect(mx, my, pw, ph, 16);
      ctx.fill();

      // Inner border (double line effect)
      ctx.strokeStyle = POSTER_MUTED;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(mx + 36, my + 36, pw - 72, ph - 72, 10);
      ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(mx + 46, my + 46, pw - 92, ph - 92, 8);
      ctx.stroke();

      let y = my + 110;
      const cx = w / 2;

      // ── TOP SECTION: header → WANTED → subtitle (no seal here) ──

      // "SHARK HUMAN ALLIANCE" header — small, tracking-heavy
      ctx.fillStyle = POSTER_MUTED;
      ctx.font = "600 32px 'Geist', sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "12px";
      ctx.fillText(t("posterHeader").toUpperCase(), cx, y);
      ctx.letterSpacing = "0px";
      y += 60;

      // Thin decorative line above WANTED
      ctx.strokeStyle = POSTER_MUTED;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 260, y);
      ctx.lineTo(cx + 260, y);
      ctx.stroke();
      y += 130;

      // "WANTED" — big bold
      ctx.fillStyle = POSTER_RED;
      ctx.font = "900 200px 'Geist', sans-serif";
      ctx.fillText(t("wantedTitle"), cx, y);
      y += 30;

      // Red decorative line below WANTED
      ctx.strokeStyle = POSTER_RED;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 340, y);
      ctx.lineTo(cx + 340, y);
      ctx.stroke();
      y += 70;

      // Subtitle — "DANGEROUSLY UNPROTECTED"
      ctx.fillStyle = POSTER_INK;
      ctx.font = "600 44px 'Geist', sans-serif";
      ctx.letterSpacing = "6px";
      ctx.fillText(t("wantedSubtitle").toUpperCase(), cx, y);
      ctx.letterSpacing = "0px";
      y += 100;

      // ── NAME — large display ──
      ctx.fillStyle = POSTER_INK;
      ctx.font = "900 108px 'Geist', sans-serif";
      let fontSize = 108;
      while (ctx.measureText(displayName).width > pw - 200 && fontSize > 48) {
        fontSize -= 4;
        ctx.font = `900 ${fontSize}px 'Geist', sans-serif`;
      }
      ctx.fillText(displayName, cx, y);
      y += 28;

      // Underline
      const nameW = Math.min(ctx.measureText(displayName).width + 60, pw - 200);
      ctx.strokeStyle = POSTER_GOLD;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - nameW / 2, y);
      ctx.lineTo(cx + nameW / 2, y);
      ctx.stroke();
      y += 70;

      // ── CHARGES ──
      ctx.fillStyle = POSTER_RED;
      ctx.font = "700 38px 'Geist', sans-serif";
      ctx.letterSpacing = "5px";
      ctx.fillText(t("chargesLabel").toUpperCase(), cx, y);
      ctx.letterSpacing = "0px";
      y += 58;

      ctx.fillStyle = POSTER_INK;
      ctx.font = "500 34px 'Geist', sans-serif";
      ctx.textAlign = "center";
      for (const charge of selectedCharges) {
        const words = charge.split(" ");
        let line = "";
        const lines: string[] = [];
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > pw - 260) {
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        }
        if (line) lines.push(line);
        for (const l of lines) {
          ctx.fillText(l, cx, y);
          y += 48;
        }
        y += 12;
      }
      y += 30;

      // ── REWARD ──
      ctx.fillStyle = POSTER_GOLD;
      ctx.font = "700 34px 'Geist', sans-serif";
      ctx.letterSpacing = "4px";
      ctx.fillText(t("rewardLabel").toUpperCase(), cx, y);
      ctx.letterSpacing = "0px";
      y += 54;

      ctx.fillStyle = POSTER_INK;
      ctx.font = "600 38px 'Geist', sans-serif";
      ctx.fillText(t("rewardText"), cx, y);
      y += 90;

      // ── CTA BUTTON ──
      const btnW = 1000, btnH = 100;
      const btnX = cx - btnW / 2, btnY = y - 10;
      ctx.fillStyle = POSTER_RED;
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 50);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 40px 'Geist', sans-serif";
      ctx.fillText(t("ctaButton"), cx, btnY + btnH / 2 + 13);

      // ── BOTTOM SECTION: seal (right) + QR (left) + footer ──
      const bottomY = h - my - 240;
      const sealSize = 260;
      const qrSize = 200;

      // Seal — bottom right
      try {
        const sealImg = await ensureSealLoaded();
        const sealX = mx + pw - 60 - sealSize;
        const sealCY = bottomY + sealSize / 2;
        ctx.save();
        ctx.beginPath();
        ctx.arc(sealX + sealSize / 2, sealCY, sealSize / 2 + 10, 0, Math.PI * 2);
        ctx.fillStyle = "#e8d5b0";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sealX + sealSize / 2, sealCY, sealSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(sealImg, sealX, bottomY, sealSize, sealSize);
        ctx.restore();
        ctx.strokeStyle = POSTER_GOLD;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(sealX + sealSize / 2, sealCY, sealSize / 2 + 10, 0, Math.PI * 2);
        ctx.stroke();
      } catch {
        // seal failed to load — skip
      }

      // QR code — bottom left
      const purchaseUrl = typeof window !== "undefined"
        ? buildAbsoluteLocalizedUrl(window.location.origin, locale, "/verify?id=sample")
        : buildAbsoluteLocalizedUrl("https://sharkhumanalliance.com", locale, "/verify?id=sample");
      try {
        const qrImg = await loadQrImage(purchaseUrl);
        const qrX = mx + 60;
        const qrY = bottomY + (sealSize - qrSize) / 2;
        // White background behind QR
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
        // Label under QR
        ctx.fillStyle = POSTER_MUTED;
        ctx.font = "500 22px 'Geist', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(t("qrLabel"), qrX + qrSize / 2, qrY + qrSize + 36);
      } catch {
        // QR failed to load — skip
      }

      // Alliance branding at bottom
      ctx.fillStyle = POSTER_MUTED;
      ctx.font = "400 28px 'Geist', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(t("posterFooter"), cx, h - my - 60);
    },
    [name, selectedCharges, t, ensureSealLoaded, loadQrImage]
  );

  const handleGenerate = useCallback(async () => {
    trackEvent("wanted_poster_generate", { name_length: name.trim().length });
    setGenerated(true);
    // Small delay to ensure canvas is mounted
    await new Promise((r) => setTimeout(r, 100));
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 2100;
    canvas.height = 2970;
    await drawPoster(ctx, 2100, 2970);
  }, [drawPoster]);

  const handleDownload = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    trackEvent("wanted_poster_download");
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
    trackEvent("wanted_poster_share");
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
        // Fallback: copy page link to clipboard
        const shareUrl = window.location.href;
        await navigator.clipboard.writeText(shareUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
      }
    } catch {
      // User cancelled share or error — try clipboard as last resort
      try {
        await navigator.clipboard.writeText(window.location.href);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
      } catch {
        // clipboard also failed — silently ignore
      }
    }
  }, [name, t]);

  const handleRegenerate = useCallback(() => {
    setGenerated(false);
    setName("");
  }, []);

  const giftUrl = `/purchase?tier=protected&gift=true${name.trim() ? `&name=${encodeURIComponent(name.trim())}` : ""}`;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <section className="py-14 bg-gradient-to-b from-red-950/5 to-transparent">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
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
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          {!generated ? (
            /* ── Form state ──────────────────────────── */
            <div className="rounded-xl border border-red-100 bg-white p-8 shadow-sm">
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
                  <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-white px-5 py-4 shadow-sm transition focus-within:border-red-400 focus-within:shadow-md">
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
                      className="rounded-lg border border-red-100 bg-red-50/50 px-4 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!name.trim()}
                  className="mt-4 w-full rounded-lg bg-red-600 px-6 py-4 text-base font-bold text-white transition hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
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
              <div className="rounded-xl overflow-hidden shadow-md border border-amber-900/20">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto"
                  style={{ aspectRatio: "210/297" }}
                />
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <LocalizedLink
                  href={giftUrl}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-4 text-center text-base font-bold text-white transition hover:bg-[var(--accent-dark)]"
                >
                  🛡️ {t("giftCta", { name: name.trim() || t("defaultName") })}
                </LocalizedLink>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="rounded-lg border border-[var(--border)] bg-white px-4 py-3.5 text-sm font-semibold text-[var(--brand-dark)] transition hover:bg-gray-50 disabled:opacity-60"
                  >
                    {downloading ? t("downloadingButton") : t("downloadButton")}
                  </button>

                  <button
                    onClick={handleShare}
                    className={`rounded-lg border px-4 py-3.5 text-sm font-semibold transition ${linkCopied ? "border-teal-300 bg-teal-50 text-teal-700" : "border-[var(--border)] bg-white text-[var(--brand-dark)] hover:bg-gray-50"}`}
                  >
                    {linkCopied ? t("linkCopied") : t("shareButton")}
                  </button>
                </div>

                <button
                  onClick={handleRegenerate}
                  className="w-full text-center text-sm font-medium text-[var(--muted)] transition hover:text-[var(--brand-dark)]"
                >
                  {t("newPoster")}
                </button>
              </div>

              {/* Viral sharing prompt */}
              <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-6 text-center">
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
      <section className="border-t border-[var(--border)] bg-white py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
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
            <LocalizedLink
              href="/purchase?tier=protected&gift=true"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white transition hover:bg-[var(--accent-dark)]"
            >
              🎁 {t("bottomCta")}
            </LocalizedLink>
          </div>
        </div>
      </section>
    </div>
  );
}
