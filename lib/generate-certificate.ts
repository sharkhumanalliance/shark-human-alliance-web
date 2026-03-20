import jsPDF from "jspdf";

/** Cache the seal image as a base64 data URL so we only fetch once. */
let sealImageCache: string | null = null;

async function loadSealImage(): Promise<string | null> {
  if (sealImageCache) return sealImageCache;
  try {
    const res = await fetch("/seal.png");
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        sealImageCache = reader.result as string;
        resolve(sealImageCache);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

type PageFormat = "a4" | "letter";

type CertificateData = {
  name: string;
  tier: "basic" | "protected" | "nonsnack" | "business";
  date: string;
  dedication: string;
  registryId: string;
  format?: PageFormat;
  /** Single pre-selected reason to display (instead of all reasons) */
  selectedReason?: string;
  t: {
    header: string;
    subtitle: string;
    certTitle: string;
    certifies: string;
    statusLabel: string;
    tierName: string;
    body: string;
    reasonsLabel: string;
    reasons: string[];
    privileges: string;
    validityNote: string;
    sig1Name: string;
    sig1Title: string;
    sig2Name: string;
    sig2Title: string;
    sealText: string;
    dedicationLabel: string;
    dateLabel: string;
    registryIdLabel: string;
    disclaimer: string;
  };
};

const TIER_COLORS: Record<string, [number, number, number]> = {
  basic: [13, 148, 136],
  protected: [13, 148, 136],    // teal-600
  nonsnack: [234, 88, 12],      // orange-600
  business: [124, 58, 237],     // violet-600
};

const TIER_LIGHT: Record<string, [number, number, number]> = {
  basic: [204, 251, 241],
  protected: [204, 251, 241],   // teal-100
  nonsnack: [255, 237, 213],    // orange-100
  business: [237, 233, 254],    // violet-100
};

/** Pick a single reason from the pool, stable per name (same logic as the preview component). */
function pickReason(name: string, reasons: string[]): string | null {
  if (!reasons || reasons.length === 0) return null;
  let hash = 0;
  const seed = name || "default";
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return reasons[Math.abs(hash) % reasons.length];
}

export async function generateCertificatePDF(data: CertificateData): Promise<jsPDF> {
  const pageFormat = data.format || "a4";
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: pageFormat,
  });

  const W = doc.internal.pageSize.getWidth();   // ~210 for A4
  const H = doc.internal.pageSize.getHeight();  // ~297 for A4
  const cx = W / 2;
  const color = TIER_COLORS[data.tier] || TIER_COLORS.protected;
  const light = TIER_LIGHT[data.tier] || TIER_LIGHT.protected;

  // ─── Background ───
  doc.setFillColor(light[0], light[1], light[2]);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(
    Math.min(255, light[0] + 15),
    Math.min(255, light[1] + 15),
    Math.min(255, light[2] + 15)
  );
  doc.rect(16, 16, W - 32, H - 32, "F");

  // ─── Borders ───
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(1.5);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setLineWidth(0.4);
  doc.rect(12, 12, W - 24, H - 24);

  // Corner ornaments
  const corners = [[14, 14], [W - 14, 14], [14, H - 14], [W - 14, H - 14]];
  doc.setFillColor(color[0], color[1], color[2]);
  corners.forEach(([x, y]) => doc.circle(x, y, 1.5, "F"));

  // Shark watermark
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(140);
  doc.setGState(new (doc as any).GState({ opacity: 0.04 }));
  doc.text("🦈", cx, H / 2, { align: "center" });
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // ─── Header ───
  let y = 30;
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(data.t.header, cx, y, { align: "center" });
  y += 5;

  doc.setTextColor(100, 120, 140);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(data.t.subtitle, cx, y, { align: "center" });
  y += 5;

  // Divider
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.3);
  doc.line(cx - 35, y, cx + 35, y);
  y += 10;

  // ─── Certificate title ───
  doc.setTextColor(23, 61, 99);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(data.t.certTitle, W - 50);
  doc.text(titleLines, cx, y, { align: "center" });
  y += titleLines.length * 8 + 6;

  // ─── "This certifies that" ───
  doc.setTextColor(100, 120, 140);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.t.certifies, cx, y, { align: "center" });
  y += 10;

  // ─── Name ───
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(data.name, cx, y, { align: "center" });
  y += 4;

  // Decorative line under name
  const nameW = doc.getTextWidth(data.name);
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.5);
  doc.line(cx - nameW / 2 - 5, y, cx + nameW / 2 + 5, y);
  y += 8;

  // ─── Status + Tier badge ───
  doc.setTextColor(100, 120, 140);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.t.statusLabel, cx, y, { align: "center" });
  y += 7;

  const tierNameW = doc.getTextWidth(data.t.tierName) * 14 / doc.getFontSize();
  doc.setFillColor(light[0], light[1], light[2]);
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(cx - tierNameW / 2 - 8, y - 2, tierNameW + 16, 10, 3, 3, "FD");
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(data.t.tierName, cx, y + 5, { align: "center" });
  y += 18;

  // ─── Seal (image) ───
  const sealDataUrl = await loadSealImage();
  const sealSize = 28; // mm
  if (sealDataUrl) {
    doc.addImage(sealDataUrl, "PNG", cx - sealSize / 2, y, sealSize, sealSize);
  } else {
    // Fallback: draw circles if image can't be loaded
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.8);
    doc.circle(cx, y + sealSize / 2, 14);
    doc.setLineWidth(0.3);
    doc.circle(cx, y + sealSize / 2, 12);
  }
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "bold");
  const sealLines = doc.splitTextToSize(data.t.sealText, 20);
  doc.text(sealLines, cx, y + sealSize + 3, { align: "center" });
  y += sealSize + 8;

  // ─── Single reason (matching preview) ───
  const reason = data.selectedReason || pickReason(data.name, data.t.reasons);
  if (reason) {
    doc.setTextColor(100, 120, 140);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const reasonLabel = doc.splitTextToSize(data.t.reasonsLabel, W - 60);
    doc.text(reasonLabel, cx, y, { align: "center" });
    y += reasonLabel.length * 4 + 2;

    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const reasonLines = doc.splitTextToSize(reason, W - 60);
    doc.text(reasonLines, cx, y, { align: "center" });
    y += reasonLines.length * 4 + 4;
  }

  // ─── Privileges ───
  if (data.t.privileges) {
    doc.setTextColor(80, 100, 120);
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    const privLines = doc.splitTextToSize(data.t.privileges, W - 60);
    doc.text(privLines, cx, y, { align: "center" });
    y += privLines.length * 3.5 + 4;
  }

  // ─── Dedication ───
  if (data.dedication) {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.2);
    doc.line(cx - 30, y, cx + 30, y);
    y += 5;
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(data.t.dedicationLabel, cx, y, { align: "center" });
    y += 5;
    doc.setTextColor(80, 100, 120);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    const dedLines = doc.splitTextToSize(`"${data.dedication}"`, W - 60);
    doc.text(dedLines, cx, y, { align: "center" });
    y += dedLines.length * 4 + 4;
  }

  // ─── Bottom section (pinned from bottom) ───

  // Date + Registry (two columns)
  const bottomStart = H - 60;
  const leftCol = W / 4;
  const rightCol = (W * 3) / 4;

  doc.setTextColor(100, 120, 140);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(data.t.dateLabel, leftCol, bottomStart, { align: "center" });
  doc.text(data.t.registryIdLabel, rightCol, bottomStart, { align: "center" });

  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.2);
  doc.line(leftCol - 25, bottomStart + 2, leftCol + 25, bottomStart + 2);
  doc.line(rightCol - 25, bottomStart + 2, rightCol + 25, bottomStart + 2);

  doc.setTextColor(23, 61, 99);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(data.date, leftCol, bottomStart + 7, { align: "center" });
  doc.text(data.registryId, rightCol, bottomStart + 7, { align: "center" });

  // Validity note
  if (data.t.validityNote) {
    doc.setTextColor(160, 170, 180);
    doc.setFontSize(6);
    doc.setFont("helvetica", "italic");
    doc.text(data.t.validityNote, cx, bottomStart + 14, { align: "center" });
  }

  // Signatures
  const sigY = bottomStart + 22;
  doc.setTextColor(80, 100, 120);
  doc.setFontSize(10);
  doc.setFont("times", "italic");
  doc.text(data.t.sig1Name, leftCol, sigY, { align: "center" });
  doc.text(data.t.sig2Name, rightCol, sigY, { align: "center" });

  doc.setDrawColor(150, 160, 170);
  doc.setLineWidth(0.2);
  doc.line(leftCol - 25, sigY + 2, leftCol + 25, sigY + 2);
  doc.line(rightCol - 25, sigY + 2, rightCol + 25, sigY + 2);

  doc.setTextColor(160, 170, 180);
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "normal");
  const sig1Lines = doc.splitTextToSize(data.t.sig1Title, 50);
  const sig2Lines = doc.splitTextToSize(data.t.sig2Title, 50);
  doc.text(sig1Lines, leftCol, sigY + 6, { align: "center" });
  doc.text(sig2Lines, rightCol, sigY + 6, { align: "center" });

  // Disclaimer
  doc.setTextColor(180, 185, 190);
  doc.setFontSize(5);
  doc.setFont("helvetica", "italic");
  const disclaimerLines = doc.splitTextToSize(data.t.disclaimer, W - 40);
  doc.text(disclaimerLines, cx, H - 18, { align: "center" });

  return doc;
}
