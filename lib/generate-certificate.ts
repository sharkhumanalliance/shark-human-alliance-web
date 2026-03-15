import jsPDF from "jspdf";

type CertificateData = {
  name: string;
  tier: "basic" | "protected" | "nonsnack";
  date: string;
  dedication: string;
  registryId: string;
  // Translation strings
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
  basic: [56, 132, 195],      // sky blue
  protected: [20, 120, 100],   // teal
  nonsnack: [220, 100, 60],    // warm orange
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

  // Background
  doc.setFillColor(250, 252, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Decorative border
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  doc.setLineWidth(0.5);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

  // Corner decorations
  const corners = [
    [15, 15], [pageWidth - 15, 15],
    [15, pageHeight - 15], [pageWidth - 15, pageHeight - 15],
  ];
  doc.setFillColor(color[0], color[1], color[2]);
  corners.forEach(([x, y]) => {
    doc.circle(x, y, 2, "F");
  });

  // Header
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.t.header, pageWidth / 2, 28, { align: "center" });

  // Subtitle
  doc.setTextColor(100, 120, 140);
  doc.setFontSize(8);
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
  doc.setTextColor(23, 61, 99);
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

  // Tier name
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(data.t.tierName, pageWidth / 2, 103, { align: "center" });

  // Body text
  doc.setTextColor(80, 100, 120);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const bodyLines = doc.splitTextToSize(data.t.body, pageWidth - 80);
  doc.text(bodyLines, pageWidth / 2, 115, { align: "center" });

  // Dedication (if present)
  let yPos = 115 + bodyLines.length * 4.5;

  if (data.dedication) {
    yPos += 5;
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(data.t.dedicationLabel, pageWidth / 2, yPos, { align: "center" });
    yPos += 5;
    doc.setTextColor(80, 100, 120);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(`"${data.dedication}"`, pageWidth / 2, yPos, { align: "center" });
    yPos += 5;
  }

  // Bottom section: date, registry ID, seal
  const bottomY = pageHeight - 40;

  // Date
  doc.setTextColor(100, 120, 140);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(data.t.dateLabel, 40, bottomY, { align: "center" });
  doc.setTextColor(23, 61, 99);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(data.date, 40, bottomY + 5, { align: "center" });

  // Seal (center)
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.8);
  doc.circle(pageWidth / 2, bottomY, 12);
  doc.circle(pageWidth / 2, bottomY, 10);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text("SHA", pageWidth / 2, bottomY - 2, { align: "center" });
  doc.setFontSize(3.5);
  doc.setFont("helvetica", "normal");
  doc.text(data.t.seal, pageWidth / 2, bottomY + 2, { align: "center" });

  // Registry ID
  doc.setTextColor(100, 120, 140);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(data.t.registryIdLabel, pageWidth - 40, bottomY, { align: "center" });
  doc.setTextColor(23, 61, 99);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(data.registryId, pageWidth - 40, bottomY + 5, { align: "center" });

  // Footer disclaimer
  doc.setTextColor(160, 170, 180);
  doc.setFontSize(6);
  doc.setFont("helvetica", "italic");
  doc.text(data.t.footer, pageWidth / 2, pageHeight - 16, { align: "center" });

  return doc;
}
