import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import enMessages from "@/messages/en.json";
import esMessages from "@/messages/es.json";

/**
 * Dynamic OG image for the Wanted poster.
 *
 *   /og/wanted?name=Dave%20from%20Accounting&tone=clear&locale=en
 *
 * Renders a 1200x630 PNG that mimics the on-page canvas poster (dark wood
 * frame + parchment + WANTED + name + a few charges). Used in OpenGraph /
 * Twitter card metadata of:
 *   - /[locale]/wanted        (generic share — sample name)
 *   - /[locale]/wanted/case   (personalized share — query-string name)
 *
 * Determinism: the same name+tone always produces the same subtitle and
 * charges (nameHash → modular index into the message pool). That way a
 * shared link always previews the same image regardless of edge cache.
 */

export const runtime = "nodejs";
// 24h public + stale-while-revalidate; safe because the image is purely a
// deterministic function of query params.
const CACHE_HEADER = "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";

// Poster palette (matches components/wanted/wanted-content.tsx).
const POSTER_BG = "#3a2515";
const POSTER_PAPER = "#f6ecd8";
const POSTER_INK = "#102941";
const POSTER_RED = "#b94135";
const POSTER_RED_DARK = "#7a2a22";
const POSTER_MUTED = "#6f7c83";
const POSTER_FRAME = "#2b1a0e";

const TONES = ["mild", "clear", "emergency"] as const;
type Tone = (typeof TONES)[number];
type Locale = "en" | "es";

const messagesByLocale: Record<Locale, typeof enMessages> = {
  en: enMessages,
  es: esMessages,
};

function nameHash(name: string): number {
  let hash = 0;
  const source = name || "default";
  for (let i = 0; i < source.length; i++) {
    hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickFrom<T>(items: readonly T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

function clampName(input: string, limit = 28): string {
  const trimmed = input.trim();
  if (trimmed.length <= limit) return trimmed;
  // Try to break at the nearest whitespace before the limit so we don't cut
  // mid-word for very long inputs.
  const cut = trimmed.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > limit * 0.6) return cut.slice(0, lastSpace) + "…";
  return cut + "…";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const rawLocale = (searchParams.get("locale") || "en").toLowerCase();
  const locale: Locale = rawLocale === "es" ? "es" : "en";

  const rawTone = (searchParams.get("tone") || "clear").toLowerCase();
  const tone: Tone = (TONES as readonly string[]).includes(rawTone)
    ? (rawTone as Tone)
    : "clear";

  const messages = messagesByLocale[locale];
  const wanted = messages.wanted;

  const rawName = searchParams.get("name") || "";
  const displayName = clampName(rawName || wanted.defaultName).toUpperCase();
  const seed = nameHash(`${displayName}::${tone}::og`);

  const posterSubtitles = wanted.posterSubtitles[tone];
  const subtitle = pickFrom(posterSubtitles, seed);

  const charges = wanted.toneCharges[tone];
  const charge1 = pickFrom(charges, seed, 0);
  const charge2 = pickFrom(charges, seed, 5);
  const charge3 = pickFrom(charges, seed, 11);

  const rewardText = wanted.tones[tone].rewardText;
  const bureauLabel = wanted.label;
  const chargesLabel = wanted.chargesLabel;
  const rewardLabel = wanted.rewardLabel;
  const wantedTitle = wanted.wantedTitle;
  const posterFooter = wanted.posterFooter;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: POSTER_BG,
          padding: 24,
        }}
      >
        {/* Inner parchment */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: POSTER_PAPER,
            border: `6px solid ${POSTER_FRAME}`,
            padding: "30px 56px 28px 56px",
          }}
        >
          {/* Top bureau strip */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 18,
              letterSpacing: 4,
              color: POSTER_RED_DARK,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            <div style={{ display: "flex" }}>{bureauLabel}</div>
            <div style={{ display: "flex" }}>
              {locale === "es" ? "Caso abierto" : "Case open"}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              height: 2,
              backgroundColor: POSTER_RED_DARK,
              marginTop: 10,
              opacity: 0.6,
            }}
          />

          {/* WANTED */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontSize: 140,
              fontWeight: 900,
              color: POSTER_RED,
              letterSpacing: 8,
              lineHeight: 1.05,
              marginTop: 10,
            }}
          >
            {wantedTitle}
          </div>

          {/* Subtitle */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              textAlign: "center",
              fontSize: 22,
              fontStyle: "italic",
              color: POSTER_INK,
              marginTop: 18,
              paddingLeft: 40,
              paddingRight: 40,
              lineHeight: 1.25,
            }}
          >
            {subtitle}
          </div>

          {/* Name */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              textAlign: "center",
              fontSize: 72,
              fontWeight: 900,
              color: POSTER_INK,
              letterSpacing: 4,
              marginTop: 16,
              lineHeight: 1.05,
            }}
          >
            {displayName}
          </div>

          {/* Charges block */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 15,
                color: POSTER_RED_DARK,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              {chargesLabel}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 20,
                color: POSTER_INK,
                marginTop: 2,
              }}
            >
              • {charge1}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 20,
                color: POSTER_INK,
                marginTop: 2,
              }}
            >
              • {charge2}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 20,
                color: POSTER_INK,
                marginTop: 2,
              }}
            >
              • {charge3}
            </div>
          </div>

          {/* Spacer */}
          <div style={{ display: "flex", flex: 1 }} />

          {/* Footer row: reward + brand */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: 18,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 14,
                  color: POSTER_RED_DARK,
                  fontWeight: 700,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                }}
              >
                {rewardLabel}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 700,
                  color: POSTER_INK,
                  marginTop: 2,
                }}
              >
                {rewardText}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 13,
                color: POSTER_MUTED,
                maxWidth: 520,
                textAlign: "right",
                lineHeight: 1.3,
              }}
            >
              {posterFooter}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": CACHE_HEADER,
      },
    },
  );
}
