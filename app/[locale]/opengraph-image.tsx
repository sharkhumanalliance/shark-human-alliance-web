import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Shark Human Alliance — Funny Shark Certificates";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          background: "#162d50",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient blobs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(30, 90, 140, 0.55)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -60,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(238, 138, 69, 0.18)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 180,
            right: 160,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "rgba(125, 181, 230, 0.12)",
            display: "flex",
          }}
        />

        {/* Top label */}
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 64,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              background: "rgba(238, 138, 69, 0.18)",
              border: "1px solid rgba(238, 138, 69, 0.5)",
              borderRadius: 40,
              padding: "6px 18px",
              color: "#ee8a45",
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Official paperwork
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 64px",
          }}
        >
          {/* Brand name */}
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "rgba(180, 210, 240, 0.7)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 20,
              display: "flex",
            }}
          >
            Shark Human Alliance
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              maxWidth: 680,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ display: "flex" }}>Funny shark</span>
            <span style={{ color: "#ee8a45", display: "flex" }}>
              certificates.
            </span>
          </div>

          {/* Subline */}
          <div
            style={{
              marginTop: 28,
              fontSize: 26,
              color: "rgba(180, 210, 240, 0.85)",
              maxWidth: 600,
              lineHeight: 1.4,
              display: "flex",
            }}
          >
            Personalized gift that funds real shark conservation.
          </div>

          {/* Price + CTA pill */}
          <div
            style={{
              marginTop: 40,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                background: "#ee8a45",
                borderRadius: 40,
                padding: "14px 36px",
                color: "#ffffff",
                fontSize: 22,
                fontWeight: 700,
                display: "flex",
              }}
            >
              From $4
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 40,
                padding: "14px 28px",
                color: "rgba(255,255,255,0.8)",
                fontSize: 20,
                fontWeight: 500,
                display: "flex",
              }}
            >
              Instant digital delivery
            </div>
          </div>
        </div>

        {/* Right side — decorative certificate card */}
        <div
          style={{
            position: "absolute",
            right: 64,
            top: "50%",
            transform: "translateY(-50%) rotate(4deg)",
            width: 310,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: "28px 28px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "rgba(180,210,240,0.6)",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            United Oceans Diplomatic Corps
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1.3,
              display: "flex",
            }}
          >
            Certificate of Diplomatic Protection
          </div>
          <div
            style={{
              marginTop: 8,
              height: 1,
              background: "rgba(255,255,255,0.12)",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 11,
              color: "rgba(180,210,240,0.5)",
              display: "flex",
            }}
          >
            This certifies that
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#ee8a45",
              display: "flex",
            }}
          >
            Your Name Here
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(180,210,240,0.5)",
              lineHeight: 1.4,
              marginTop: 4,
              display: "flex",
            }}
          >
            has been declared entirely unsuitable for shark consumption anywhere in the world.
          </div>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "rgba(180,210,240,0.4)",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <div style={{ display: "flex" }}>Finnley Mako</div>
              <div style={{ display: "flex" }}>Chief Diplomat</div>
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "2px solid rgba(238,138,69,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                color: "rgba(238,138,69,0.6)",
                textAlign: "center",
                letterSpacing: "0.04em",
              }}
            >
              SHA SEAL
            </div>
          </div>
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 64,
            fontSize: 16,
            color: "rgba(180, 210, 240, 0.4)",
            letterSpacing: "0.06em",
            display: "flex",
          }}
        >
          sharkhumanalliance.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
