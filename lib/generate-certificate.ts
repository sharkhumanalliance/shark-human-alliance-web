import jsPDF from "jspdf";

type CertificateData = {
  name: string;
  tier: "basic" | "protected" | "nonsnack" | "business";
  date: string;
  dedication: string;
  registryId: string;
  t: {
    header: string;
    subtitle: string;
    certTitle: string;
    certifies: string;
    statusLabel: string;
    tierName: string;
    body: string;
    dedicationLabel: string;
    dateLabel: string;
    registryIdLabel: string;
    seal: string;
    footer: string;
  };
};

const TIER_COLORS: Record<string, [number, number, number]> = {
  basic: [56, 132, 195],
  protected: [13, 148, 136],    // teal-600
  nonsnack: [234, 88, 12],      // orange-600
  business: [124, 58, 237],     // violet-600
};

const TIER_LIGHT: Record<string, [number, number, number]> = {
  basic: [219, 234, 254],
  protected: [204, 251, 241],   // teal-100
  nonsnack: [255, 237, 213],    // orange-100
  business: [237, 233, 254],    // violet-100
};

export function generateCertificatePDF(data: CertificateData): jsPDF {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const color = TIER_COLORS[data.tier] || TIER_COLORS.protected;
  const light = TIER_LIGHT[data.tier] || TIER_LIGHT.protected;

  // Background gradient (simulated)
  doc.setFillColor(light[0], light[1], light[2]);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  // Lighter center
  doc.setFillColor(
    Math.min(255, light[0] + 15),
    Math.min(255, light[1] + 15),
    Math.min(255, light[2] + 15)
  );
  doc.rect(20, 20, pageWidth - 40, pageHeight - 40, "F");

  // Outer decorative border
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(1.5);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Inner decorative border
  doc.setLineWidth(0.4);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Corner ornaments
  const corners = [
    [14, 14], [pageWidth - 14, 14],
    [14, pageHeight - 14], [pageWidth - 14, pageHeight - 14],
  ];
  doc.setFillColor(color[0], color[1], color[2]);
  corners.forEach(([x, y]) => {
    doc.circle(x, y, 1.5, "F");
  });

  // Shark watermark (very light, centered)
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(120);
  doc.setGState(new (doc as any).GState({ opacity: 0.04 }));
  doc.text("🦈", pageWidth / 2, pageHeight / 2 + 10, { align: "center" });
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Header
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(data.t.header, pageWidth / 2, 28, { align: "center" });

  // Subtitle
  doc.setTextColor(100, 120, 140);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(data.t.subtitle, pageWidth / 2, 34, { align: "center" });

  // Divider line
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.3);
  doc.line(pageWidth / 2 - 40, 38, pageWidth / 2 + 40, 38);

  // Certificate title
  doc.setTextColor(23, 61, 99);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(data.t.certTitle, pageWidth / 2, 52, { align: "center" });

  // "This certifies that"
  doc.setTextColor(100, 120, 140);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(data.t.certifies, pageWidth / 2, 65, { align: "center" });

  // Name
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(data.name, pageWidth / 2, 80, { align: "center" });

  // Decorative line under name
  const nameWidth = doc.getTextWidth(data.name);
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.5);
  doc.line(
    pageWidth / 2 - nameWidth / 2 - 5, 83,
    pageWidth / 2 + nameWidth / 2 + 5, 83
  );

  // "has been granted the status of"
  doc.setTextColor(100, 120, 140);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(data.t.statusLabel, pageWidth / 2, 93, { align: "center" });

  // Tier badge (rounded rect background)
  const tierNameWidth = doc.getTextWidth(data.t.tierName) * 18 / doc.getFontSize();
  doc.setFillColor(light[0], light[1], light[2]);
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(
    pageWidth / 2 - tierNameWidth / 2 - 8, 96,
    tierNameWidth + 16, 10,
    3, 3, "FD"
  );

  // Tier name
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(data.t.tierName, pageWidth / 2, 103.5, { align: "center" });

  // Body text
  doc.setTextColor(80, 100, 120);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  const bodyLines = doc.splitTextToSize(data.t.body, pageWidth - 80);
  doc.text(bodyLines, pageWidth / 2, 115, { align: "center" });

  // Dedication (if present)
  let yPos = 115 + bodyLines.length * 4.5;

  if (data.dedication) {
    yPos += 5;
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.2);
    doc.line(pageWidth / 2 - 30, yPos - 2, pageWidth / 2 + 30, yPos - 2);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(data.t.dedicationLabel, pageWidth / 2, yPos + 2, { align: "center" });
    yPos += 6;
    doc.setTextColor(80, 100, 120);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(`"${data.dedication}"`, pageWidth / 2, yPos, { align: "center" });
    yPos += 5;
  }

  // Seal (center bottom)
  const bottomY = pageHeight - 38;

  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.8);
  doc.circle(pageWidth / 2, bottomY, 12);
  doc.setLineWidth(0.3);
  doc.circle(pageWidth / 2, bottomY, 10);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("SHA", pageWidth / 2, bottomY - 2, { align: "center" });
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "normal");
  const sealLines = doc.splitTextToSize(data.t.seal, 18);
  doc.text(sealLines, pageWidth / 2, bottomY + 2, { align: "center" });

  // Date (left)
  doc.setTextColor(100, 120, 140);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(data.t.dateLabel, 40, bottomY - 3, { align: "center" });
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.2);
  doc.line(25, bottomY - 1, 55, bottomY - 1);
  doc.setTextColor(23, 61, 99);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(data.date, 40, bottomY + 4, { align: "center" });

  // Registry ID (right)
  doc.setTextColor(100, 120, 140);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(data.t.registryIdLabel, pageWidth - 40, bottomY - 3, { align: "center" });
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.line(pageWidth - 55, bottomY - 1, pageWidth - 25, bottomY - 1);
  doc.setTextColor(23, 61, 99);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(data.registryId, pageWidth - 40, bottomY + 4, { align: "center" });

  // Footer disclaimer
  doc.setTextColor(160, 170, 180);
  doc.setFontSize(6);
  doc.setFont("helvetica", "italic");
  doc.text(data.t.footer, pageWidth / 2, pageHeight - 16, { align: "center" });

  return doc;
}
