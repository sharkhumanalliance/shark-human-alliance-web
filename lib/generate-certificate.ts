import jsPDF from "jspdf";
import {
  getCertificateDiplomaticNote,
  getCertificateFooterAside,
  getCertificateHumorSeed,
} from "@/lib/certificate-humor";

/* ─── Image loading — supports both browser (fetch) and server (fs) ─── */

let sealImageCache: string | null = null;
let sharkImageCache: string | null = null;

/**
 * Browser-side: fetch from relative URL and convert via FileReader.
 * Falls back gracefully if not in browser context.
 */
async function loadImageAsBase64Browser(url: string): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Server-side: read from public/ directory via fs.
 */
async function loadImageFromFilesystem(filename: string): Promise<string | null> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "public", filename);
    const buffer = await fs.readFile(filePath);
    const ext = filename.endsWith(".png") ? "png" : "jpeg";
    return `data:image/${ext};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

async function loadSealImage(): Promise<string | null> {
  if (sealImageCache) return sealImageCache;
  sealImageCache =
    (await loadImageAsBase64Browser("/cert-seal.png")) ??
    (await loadImageFromFilesystem("cert-seal.png"));
  return sealImageCache;
}

async function loadSharkImage(): Promise<string | null> {
  if (sharkImageCache) return sharkImageCache;
  sharkImageCache =
    (await loadImageAsBase64Browser("/are-you-afraid.png")) ??
    (await loadImageFromFilesystem("are-you-afraid.png"));
  return sharkImageCache;
}

type PageFormat = "a4" | "letter";

export type CertificateTranslationsForPDF = {
  photoHeadline: string;
  photoTagline: string;
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

export type CertificateData = {
  name: string;
  tier: "basic" | "protected" | "nonsnack" | "business";
  date: string;
  dedication: string;
  registryId: string;
  locale?: string;
  format?: PageFormat;
  selectedReason?: string;
  t: CertificateTranslationsForPDF;
};

// All tiers use dark navy as the main accent to match the original design
const NAVY: [number, number, number] = [26, 58, 92];
const GRAY: [number, number, number] = [74, 95, 117];
const LIGHT_GRAY: [number, number, number] = [160, 180, 197];

export async function generateCertificatePDF(
  data: CertificateData
): Promise<jsPDF> {
  const pageFormat = data.format || "a4";
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: pageFormat,
  });

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const cx = W / 2;
  const margin = 13;

  // ═══════ BACKGROUND ═══════
  doc.setFillColor(238, 242, 247);
  doc.rect(0, 0, W, H, "F");

  // ═══════ SHARK PHOTO — wide banner art ═══════
  const sharkImg = await loadSharkImage();
  const photoH = W / (1999 / 722);
  if (sharkImg) {
    const isJpg = sharkImg.includes("image/jpeg") || sharkImg.includes("image/jpg");
    doc.addImage(sharkImg, isJpg ? "JPEG" : "PNG", 0, 0, W, photoH);
  } else {
    doc.setFillColor(180, 205, 230);
    doc.rect(0, 0, W, photoH, "F");
    doc.setTextColor(...GRAY);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("[are-you-afraid.png]", cx, photoH / 2, { align: "center" });
  }

  let y = photoH;

  // Blue accent line
  doc.setDrawColor(26, 111, 160);
  doc.setLineWidth(1.2);
  doc.line(0, y + 0.5, W, y + 0.5);
  y += 5;

  // ═══════ HEADER ═══════
  doc.setTextColor(...NAVY);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.text(data.t.header, cx, y, { align: "center" });
  y += 4.5;

  doc.setTextColor(...GRAY);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(data.t.subtitle, cx, y, { align: "center" });
  y += 3.5;

  // Thin divider
  doc.setDrawColor(160, 180, 197);
  doc.setLineWidth(0.2);
  doc.line(cx - 30, y, cx + 30, y);
  y += 5;

  // ═══════ CERTIFICATE TITLE ═══════
  doc.setTextColor(...NAVY);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(data.t.certTitle, W - 36);
  doc.text(titleLines, cx, y, { align: "center" });
  y += titleLines.length * 5.5 + 4;

  // ═══════ "This document officially certifies..." ═══════
  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont("times", "italic");
  doc.text(data.t.certifies, cx, y, { align: "center" });
  y += 7;

  // ═══════ NAME + SEAL — two-column layout ═══════
  const sealImg = await loadSealImage();
  const sealSize = 48;
  const leftW = W - margin * 2 - sealSize - 5;
  const sealX = W - margin - sealSize;
  const nameStartY = y;

  // Name
  doc.setTextColor(...NAVY);
  doc.setFontSize(20);
  doc.setFont("times", "bold");
  const nameStr = data.name;
  const nameLines = doc.splitTextToSize(nameStr, leftW);
  doc.text(nameLines, margin, y);
  y += nameLines.length * 9 + 2;

  // "has been granted the status of"
  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.setFont("times", "italic");
  doc.text(data.t.statusLabel, margin, y);
  y += 6;

  // "Protected Friend" — large bold
  doc.setTextColor(...NAVY);
  doc.setFontSize(16);
  doc.setFont("times", "bold");
  doc.text(data.t.tierName, margin, y);
  y += 8;

  // Seal
  if (sealImg) {
    doc.addImage(sealImg, "PNG", sealX, nameStartY - 5, sealSize, sealSize);
  } else {
    const sealCenterX = sealX + sealSize / 2;
    const sealCenterY = nameStartY - 5 + sealSize / 2;
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.5);
    doc.circle(sealCenterX, sealCenterY, sealSize / 2);
  }

  // ═══════ BODY TEXT ═══════
  const humorSeed = getCertificateHumorSeed(
    data.name,
    data.registryId,
    data.tier,
  );
  const reason =
    data.selectedReason ||
    getCertificateDiplomaticNote(humorSeed, data.locale, data.tier);
  const footerAside = getCertificateFooterAside(humorSeed, data.locale);
  const bodyParts: string[] = [];
  if (data.t.body) bodyParts.push(data.t.body);
  if (data.t.privileges) bodyParts.push(data.t.privileges);
  const fullBody = bodyParts.join(" ");

  if (fullBody) {
    doc.setTextColor(...GRAY);
    doc.setFontSize(7.5);
    doc.setFont("times", "normal");
    const bodyLines = doc.splitTextToSize(fullBody, W - margin * 2);
    doc.text(bodyLines, margin, y);
    y += bodyLines.length * 3.5 + 3;
  }

  // Dedication
  if (data.dedication) {
    doc.setTextColor(...GRAY);
    doc.setFontSize(6);
    doc.setFont("times", "italic");
    const dedLines = doc.splitTextToSize(
      `${data.t.dedicationLabel}: "${data.dedication}"`,
      W - margin * 2
    );
    doc.text(dedLines, margin, y);
    y += dedLines.length * 3 + 3;
  } else if (reason) {
    doc.setTextColor(...GRAY);
    doc.setFontSize(6);
    doc.setFont("times", "italic");
    const noteLines = doc.splitTextToSize(reason, W - margin * 2);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 3 + 3;
  }

  // ═══════ BOTTOM SECTION ═══════
  const sigY = H - 38;
  const leftCol = margin + 18;
  const rightCol = W / 2 + 18;

  // Date + Registry labels
  doc.setTextColor(...GRAY);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(data.t.dateLabel, margin, sigY - 14);
  doc.text(data.t.registryIdLabel, W / 2 + margin / 2, sigY - 14);

  // Date + Registry values
  doc.setTextColor(...NAVY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(data.date, margin, sigY - 8);
  doc.text(data.registryId, W / 2 + margin / 2, sigY - 8);

  // Signature names
  doc.setTextColor(...NAVY);
  doc.setFontSize(13);
  doc.setFont("times", "italic");
  doc.text(data.t.sig1Name, leftCol, sigY, { align: "center" });
  doc.text(data.t.sig2Name, rightCol, sigY, { align: "center" });

  // Signature lines
  doc.setDrawColor(138, 159, 181);
  doc.setLineWidth(0.3);
  doc.line(leftCol - 22, sigY + 1.5, leftCol + 22, sigY + 1.5);
  doc.line(rightCol - 22, sigY + 1.5, rightCol + 22, sigY + 1.5);

  // Sig titles
  doc.setTextColor(...LIGHT_GRAY);
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "normal");
  const sig1Lines = doc.splitTextToSize(data.t.sig1Title, 44);
  const sig2Lines = doc.splitTextToSize(data.t.sig2Title, 44);
  doc.text(sig1Lines, leftCol, sigY + 5, { align: "center" });
  doc.text(sig2Lines, rightCol, sigY + 5, { align: "center" });

  // Disclaimer
  doc.setTextColor(...LIGHT_GRAY);
  doc.setFontSize(5);
  doc.setFont("helvetica", "italic");
  const disclaimerLines = doc.splitTextToSize(
    `${data.t.disclaimer} "${footerAside}"`,
    W - margin * 2,
  );
  doc.text(disclaimerLines, cx, H - 7, { align: "center" });

  return doc;
}
