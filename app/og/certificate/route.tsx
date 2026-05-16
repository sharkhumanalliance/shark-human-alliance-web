import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import enMessages from "@/messages/en.json";
import esMessages from "@/messages/es.json";

export const runtime = "nodejs";

const CACHE_HEADER = "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";

type Locale = "en" | "es";

const messagesByLocale: Record<Locale, typeof enMessages> = {
  en: enMessages,
  es: esMessages,
};

const certificateCopyByLocale = {
  en: {
    title: "CERTIFICATE",
    subtitle: "Official Recognition",
    intro: "This certifies that",
    statusIntro: "has been officially recognized as",
    fallbackName: "Verified Human",
  },
  es: {
    title: "CERTIFICADO",
    subtitle: "Reconocimiento Oficial",
    intro: "Esto certifica que",
    statusIntro: "ha sido reconocido/a oficialmente como",
    fallbackName: "Humano verificado",
  },
} as const;

function clamp(input: string, limit: number) {
  const trimmed = input.trim();
  if (trimmed.length <= limit) return trimmed;
  const cut = trimmed.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > limit * 0.6) return `${cut.slice(0, lastSpace)}...`;
  return `${cut}...`;
}

function getTierLabel(tier: string, locale: Locale) {
  const verify = messagesByLocale[locale].verify;
  const normalized = tier.toLowerCase();
  if (normalized === "business" || normalized.includes("zone")) {
    return verify.tierBusiness;
  }
  if (normalized === "nonsnack" || normalized.includes("non-snack")) {
    return verify.tierNonsnack;
  }
  return verify.tierProtected;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawLocale = (searchParams.get("locale") || "en").toLowerCase();
  const locale: Locale = rawLocale === "es" ? "es" : "en";
  const messages = messagesByLocale[locale];

  const certificateCopy = certificateCopyByLocale[locale];
  const name = clamp(searchParams.get("name") || certificateCopy.fallbackName, 36);
  const tier = searchParams.get("tier") || "protected";
  const registryId = clamp(searchParams.get("code") || "SHA-XXXX-XXXX", 20);
  const tierLabel = getTierLabel(tier, locale);
  const verifiedLabel =
    locale === "es" ? "Certificado verificado" : "Verified certificate";
  const issuedLabel =
    locale === "es"
      ? "Registrado por Shark Human Alliance"
      : "Filed by Shark Human Alliance";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #e8fbff 0%, #ffffff 46%, #fff4df 100%)",
          padding: 42,
          color: "#102941",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            border: "1px solid rgba(16, 41, 65, 0.16)",
            borderRadius: 28,
            background: "rgba(255,255,255,0.72)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: 505,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "54px 42px",
              background: "#fff8ed",
              borderRight: "1px solid rgba(16, 41, 65, 0.16)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: 500,
                border: "6px solid #102941",
                padding: 30,
                boxShadow: "0 18px 40px rgba(16, 41, 65, 0.16)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 48,
                  fontWeight: 900,
                  letterSpacing: 1,
                }}
              >
                {certificateCopy.title}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 4,
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                }}
              >
                {certificateCopy.subtitle}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 46,
                  color: "#64748b",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 20,
                  fontStyle: "italic",
                }}
              >
                {certificateCopy.intro}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  textAlign: "center",
                  marginTop: 18,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 34,
                  fontWeight: 900,
                  lineHeight: 1.08,
                  textTransform: "uppercase",
                }}
              >
                {name}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 42,
                  color: "#64748b",
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                {certificateCopy.statusIntro}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  textAlign: "center",
                  marginTop: 16,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 31,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  textTransform: "uppercase",
                }}
              >
                {tierLabel}
              </div>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "70px 62px",
            }}
          >
            <div
              style={{
                display: "flex",
                border: "1px solid rgba(30, 58, 95, 0.18)",
                borderRadius: 999,
                padding: "8px 14px",
                color: "#1e3a5f",
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {verifiedLabel}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 64,
                fontWeight: 800,
                lineHeight: 1.02,
                letterSpacing: -1.2,
              }}
            >
              {name}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 18,
                fontSize: 32,
                fontWeight: 800,
                color: "#1a7a6d",
              }}
            >
              {tierLabel}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 34,
                fontSize: 22,
                color: "#64748b",
                lineHeight: 1.35,
              }}
            >
              {messages.hero.brandLine}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 56,
                alignItems: "center",
                gap: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 74,
                  height: 74,
                  borderRadius: 20,
                  background: "#102941",
                  color: "#ffffff",
                  fontSize: 22,
                  fontWeight: 900,
                }}
              >
                SHA
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 18, fontWeight: 800 }}>
                  {registryId}
                </div>
                <div style={{ display: "flex", marginTop: 5, fontSize: 16, color: "#64748b" }}>
                  {issuedLabel}
                </div>
              </div>
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
