import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outRoot = path.join(root, "docs", "social", "assets");

const COLORS = {
  navy: "#162D50",
  bureauNavy: "#1E3A5F",
  bureauBlue: "#2563EB",
  orange: "#EE8A45",
  paper: "#F6ECD8",
  cream: "#EFE7D4",
  muted: "#64748B",
  border: "#E2E8F0",
  red: "#B94135",
  gold: "#B98935",
  brown: "#3A2515",
  charcoal: "#1A1612",
};

const FORMATS = {
  feed: { width: 1080, height: 1350, label: "IG 4:5" },
  square: { width: 1080, height: 1080, label: "Square 1:1" },
  story: { width: 1080, height: 1920, label: "Story 9:16" },
};

const STAMPS = [
  "FILED",
  "REVIEWED",
  "REDACTED",
  "PENDING",
  "NO OBJECTIONS RECEIVED",
  "CASE OPENED",
  "CASE CLOSED",
  "PROTECTION GRANTED",
  "OBJECTION DENIED",
  "FORWARD TO LUNA",
  "RETURNED - RECIPIENT UNREACHABLE",
];

const STAMP_COLORS = {
  navy: COLORS.bureauNavy,
  red: COLORS.red,
  gold: COLORS.gold,
};

const TEMPLATES = [
  {
    id: "bureau-memo",
    title: "MEMORANDUM",
    kicker: "SHARK HUMAN ALLIANCE",
    body: "Memo 0001 - The Bureau is operational. Filing has commenced.",
    stamp: "FILED",
    mode: "document",
  },
  {
    id: "public-notice-stat-card",
    title: "100,000,000",
    kicker: "BUREAU - PUBLIC NOTICE",
    body: "sharks estimated killed by humans each year",
    stamp: "FILED",
    mode: "stat",
    source: "SOURCE - WORM ET AL. 2013",
  },
  {
    id: "wanted-case",
    title: "WANTED",
    kicker: "SHARK HUMAN ALLIANCE",
    body: "FOR OPERATING WITHOUT SHARK-FACING PAPERWORK",
    stamp: "CASE OPENED",
    mode: "wanted",
  },
  {
    id: "finnley-statement",
    title: "OFFICIAL STATEMENT",
    kicker: "FINNLEY MAKO - PRESS SPOKESPERSON",
    body: "\"Most sharks would simply swim past and continue minding their business.\"",
    stamp: "REVIEWED",
    mode: "character",
  },
  {
    id: "luna-redacted",
    title: "QUARTERLY STATEMENT",
    kicker: "DEPARTMENT OF MISUNDERSTANDING PREVENTION",
    body: "The Department has reviewed [REDACTED]. Several [REDACTED] were initialed. Filed.",
    stamp: "REDACTED",
    mode: "redacted",
  },
  {
    id: "field-report",
    title: "FIELD REPORT",
    kicker: "FILED BY F.M.",
    body: "09:14 - Subject arrived at beach. Confidence: high. Documentation: none. Recommendation: gentle administrative reminder.",
    stamp: "PENDING",
    mode: "field",
  },
  {
    id: "conservation-receipt",
    title: "CONSERVATION RECEIPT",
    kicker: "TRACKED ALLOCATION",
    body: "$1 from every Protected Friend sale goes to shark conservation. Small certificate. Real contribution.",
    stamp: "REVIEWED",
    mode: "receipt",
  },
  {
    id: "case-closed-product-bridge",
    title: "CASE CLOSED",
    kicker: "STATUS IMPROVED",
    body: "Wanted cases may now be closed with official-ish paperwork.",
    stamp: "PROTECTION GRANTED",
    mode: "bridge",
  },
  {
    id: "press-conference",
    title: "OFFICIAL STATEMENT",
    kicker: "PRESS CONFERENCE",
    body: "Finnley has prepared a statement. Luna has reviewed the shorter version.",
    stamp: "FILED",
    mode: "press",
  },
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function paperTextureSvg(width, height, variant) {
  const rng = mulberry32(variant === "clean" ? 11 : variant === "stained" ? 19 : 29);
  const base = variant === "ledger" ? "#F3EAD7" : variant === "stained" ? "#EFE3CC" : COLORS.cream;
  const dots = [];
  const dotCount = variant === "clean" ? 700 : 1200;
  for (let i = 0; i < dotCount; i += 1) {
    const x = rng() * width;
    const y = rng() * height;
    const r = 0.4 + rng() * (variant === "stained" ? 2.4 : 1.2);
    const opacity = 0.035 + rng() * 0.08;
    dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#7A684F" opacity="${opacity.toFixed(3)}"/>`);
  }

  const stains = [];
  if (variant === "stained") {
    for (let i = 0; i < 10; i += 1) {
      const x = rng() * width;
      const y = rng() * height;
      const rx = 18 + rng() * 80;
      const ry = 10 + rng() * 44;
      stains.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="#8B6F45" opacity="${(0.045 + rng() * 0.05).toFixed(3)}" transform="rotate(${(-18 + rng() * 36).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`);
    }
  }

  const ledger = [];
  if (variant === "ledger") {
    for (let y = 100; y < height; y += 58) {
      ledger.push(`<line x1="60" y1="${y}" x2="${width - 60}" y2="${y}" stroke="#BDAE8D" stroke-width="1" opacity="0.34"/>`);
    }
    for (let x = 120; x < width; x += 160) {
      ledger.push(`<line x1="${x}" y1="60" x2="${x}" y2="${height - 60}" stroke="#BDAE8D" stroke-width="1" opacity="0.22"/>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${base}"/>
  ${ledger.join("\n  ")}
  ${dots.join("\n  ")}
  ${stains.join("\n  ")}
  <rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="#D8C8A8" stroke-width="2" opacity="0.22"/>
</svg>`;
}

function stampSvg(text, color) {
  const width = 1400;
  const height = 560;
  const long = text.length > 18;
  const veryLong = text.length > 28;
  const fontSize = veryLong ? 78 : long ? 96 : 128;
  const escaped = escapeXml(text);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <g fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round" opacity="0.94" transform="rotate(-6 ${width / 2} ${height / 2})">
    <rect x="72" y="96" width="1256" height="368" rx="32" stroke-width="20"/>
    <rect x="110" y="134" width="1180" height="292" rx="18" stroke-width="6" stroke-dasharray="28 18" opacity="0.78"/>
    <line x1="190" y1="200" x2="1210" y2="200" stroke-width="5" opacity="0.55"/>
    <line x1="190" y1="360" x2="1210" y2="360" stroke-width="5" opacity="0.55"/>
    <text x="700" y="308" text-anchor="middle" dominant-baseline="middle"
      font-family="Impact, 'Arial Black', 'Roboto Condensed', sans-serif"
      font-size="${fontSize}" font-weight="900" letter-spacing="${veryLong ? 4 : 8}"
      fill="${color}" stroke="none">${escaped}</text>
    <text x="700" y="310" text-anchor="middle" dominant-baseline="middle"
      font-family="Impact, 'Arial Black', 'Roboto Condensed', sans-serif"
      font-size="${fontSize}" font-weight="900" letter-spacing="${veryLong ? 4 : 8}"
      fill="${color}" stroke="none" opacity="0.18">${escaped}</text>
  </g>
</svg>`;
}

function stampMark(stamp, color = COLORS.red, x = 710, y = 1070, scale = 0.28, angle = -8) {
  const escaped = escapeXml(stamp);
  return `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})" opacity="0.9">
    <rect x="-540" y="-150" width="1080" height="300" rx="24" fill="none" stroke="${color}" stroke-width="18"/>
    <rect x="-500" y="-112" width="1000" height="224" rx="14" fill="none" stroke="${color}" stroke-width="5" stroke-dasharray="24 16" opacity="0.72"/>
    <text x="0" y="18" text-anchor="middle" dominant-baseline="middle" font-family="Impact, 'Arial Black', sans-serif" font-size="${stamp.length > 18 ? 70 : 96}" font-weight="900" letter-spacing="5" fill="${color}">${escaped}</text>
  </g>`;
}

function lineWrap(text, maxChars = 58) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && next.length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function bodyText(lines, x, y, options = {}) {
  const {
    size = 34,
    lineHeight = 52,
    color = COLORS.navy,
    family = "Arial, sans-serif",
    weight = 600,
    anchor = "start",
    italic = false,
  } = options;
  return lines
    .map((line, index) => `<text x="${x}" y="${y + index * lineHeight}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${weight}" ${italic ? 'font-style="italic"' : ""} fill="${color}">${escapeXml(line)}</text>`)
    .join("\n");
}

function textureDefs() {
  return `<defs>
    <pattern id="paperNoise" width="90" height="90" patternUnits="userSpaceOnUse">
      <circle cx="12" cy="18" r="1.2" fill="#856D4C" opacity="0.08"/>
      <circle cx="42" cy="58" r="1" fill="#856D4C" opacity="0.06"/>
      <circle cx="70" cy="24" r="1.6" fill="#856D4C" opacity="0.05"/>
    </pattern>
  </defs>`;
}

function templateSvg(template, format) {
  const { width, height, label } = format;
  const margin = Math.round(width * 0.075);
  const safeW = width - margin * 2;
  const inset = margin + Math.round(width * 0.045);
  const insetW = width - inset * 2;
  const paperY = Math.round(height * 0.06);
  const paperH = Math.round(height * 0.88);
  const center = width / 2;
  const titleY = Math.round(height * 0.22);
  const wrapLimit =
    template.mode === "stat"
      ? 34
      : template.mode === "receipt"
        ? 32
        : template.mode === "character" || template.mode === "press"
          ? 34
          : template.mode === "document" || template.mode === "field" || template.mode === "bridge"
            ? 42
            : 50;
  const lines = lineWrap(template.body, wrapLimit);
  const stampY = Math.round(height * 0.78);
  const stampX = Math.round(width * 0.66);
  const source = template.source || "SOURCE - ADD APPROVED CITATION";

  let inner = "";
  if (template.mode === "wanted") {
    inner = `
      <rect x="${margin + 28}" y="${paperY + 28}" width="${safeW - 56}" height="${paperH - 56}" rx="12" fill="none" stroke="${COLORS.bureauNavy}" stroke-width="3" opacity="0.55"/>
      <text x="${center}" y="${Math.round(height * 0.17)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="800" letter-spacing="11" fill="${COLORS.bureauNavy}">${escapeXml(template.kicker)}</text>
      <text x="${center}" y="${Math.round(height * 0.31)}" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" font-size="${Math.round(width * 0.13)}" font-weight="900" letter-spacing="5" fill="${COLORS.red}">${escapeXml(template.title)}</text>
      <line x1="${margin + 150}" y1="${Math.round(height * 0.34)}" x2="${width - margin - 150}" y2="${Math.round(height * 0.34)}" stroke="${COLORS.red}" stroke-width="6"/>
      <circle cx="${center - 56}" cy="${Math.round(height * 0.48)}" r="88" fill="${COLORS.bureauNavy}"/>
      <path d="M${center - 170} ${Math.round(height * 0.66)} C${center - 150} ${Math.round(height * 0.54)}, ${center + 60} ${Math.round(height * 0.54)}, ${center + 92} ${Math.round(height * 0.66)} Z" fill="${COLORS.bureauNavy}"/>
      <path d="M${center + 60} ${Math.round(height * 0.47)} C${center + 170} ${Math.round(height * 0.34)}, ${center + 260} ${Math.round(height * 0.48)}, ${center + 168} ${Math.round(height * 0.59)} C${center + 125} ${Math.round(height * 0.62)}, ${center + 88} ${Math.round(height * 0.57)}, ${center + 60} ${Math.round(height * 0.47)} Z" fill="${COLORS.bureauNavy}"/>
      ${bodyText([template.body], center, Math.round(height * 0.73), { size: 30, anchor: "middle", color: COLORS.bureauNavy, weight: 800 })}
      ${stampMark(template.stamp, COLORS.red, center, Math.round(height * 0.83), 0.24, -10)}
    `;
  } else if (template.mode === "stat") {
    inner = `
      <text x="${inset}" y="${Math.round(height * 0.15)}" font-family="'Courier New', monospace" font-size="24" font-weight="800" letter-spacing="8" fill="${COLORS.bureauBlue}">${escapeXml(template.kicker)}</text>
      <text x="${center}" y="${Math.round(height * 0.36)}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.round(width * 0.11)}" font-weight="800" fill="${COLORS.charcoal}">${escapeXml(template.title)}</text>
      ${bodyText(lines, center, Math.round(height * 0.45), { size: 36, lineHeight: 50, anchor: "middle", family: "Georgia, serif", color: COLORS.charcoal, weight: 700 })}
      <line x1="${inset + 40}" y1="${Math.round(height * 0.58)}" x2="${width - inset - 40}" y2="${Math.round(height * 0.58)}" stroke="${COLORS.bureauNavy}" stroke-width="3" opacity="0.28"/>
      <text x="${inset}" y="${height - 105}" font-family="'Courier New', monospace" font-size="18" font-weight="700" letter-spacing="2" fill="${COLORS.muted}">${escapeXml(source)}</text>
      ${stampMark(template.stamp, COLORS.bureauNavy, stampX, stampY, 0.23, 7)}
    `;
  } else if (template.mode === "redacted") {
    const redY = Math.round(height * 0.38);
    inner = `
      <text x="${inset}" y="${Math.round(height * 0.15)}" font-family="'Courier New', monospace" font-size="22" font-weight="800" letter-spacing="7" fill="${COLORS.bureauBlue}">${escapeXml(template.kicker)}</text>
      <text x="${inset}" y="${titleY}" font-family="Georgia, serif" font-size="54" font-weight="800" fill="${COLORS.navy}">${escapeXml(template.title)}</text>
      <rect x="${inset}" y="${redY}" width="${insetW * 0.88}" height="34" fill="${COLORS.charcoal}"/>
      <rect x="${inset}" y="${redY + 68}" width="${insetW * 0.54}" height="34" fill="${COLORS.charcoal}"/>
      ${bodyText(["One paragraph survived review.", "Filed."], inset, redY + 160, { size: 34, lineHeight: 54, family: "Georgia, serif", color: COLORS.navy, weight: 700 })}
      <rect x="${inset}" y="${redY + 278}" width="${insetW * 0.72}" height="34" fill="${COLORS.charcoal}"/>
      ${stampMark(template.stamp, COLORS.red, stampX, stampY, 0.24, -9)}
    `;
  } else if (template.mode === "character" || template.mode === "press") {
    const circleY = Math.round(height * 0.38);
    inner = `
      <text x="${inset}" y="${Math.round(height * 0.15)}" font-family="'Courier New', monospace" font-size="22" font-weight="800" letter-spacing="7" fill="${COLORS.bureauBlue}">${escapeXml(template.kicker)}</text>
      <text x="${inset}" y="${titleY}" font-family="Georgia, serif" font-size="54" font-weight="800" fill="${COLORS.navy}">${escapeXml(template.title)}</text>
      <circle cx="${inset + 150}" cy="${circleY}" r="112" fill="#DCEBFA" stroke="${COLORS.border}" stroke-width="4"/>
      <path d="M${inset + 78} ${circleY + 72} C${inset + 100} ${circleY - 24}, ${inset + 230} ${circleY - 26}, ${inset + 262} ${circleY + 72} Z" fill="${COLORS.bureauNavy}" opacity="0.92"/>
      <text x="${inset + 150}" y="${circleY + 165}" text-anchor="middle" font-family="'Courier New', monospace" font-size="17" font-weight="800" letter-spacing="2" fill="${COLORS.muted}">PLACE MASCOT HERE</text>
      ${bodyText(lines, inset + 310, circleY - 20, { size: 32, lineHeight: 48, family: "Georgia, serif", color: COLORS.navy, weight: 700, italic: true })}
      ${stampMark(template.stamp, COLORS.bureauNavy, stampX, stampY, 0.23, 6)}
    `;
  } else if (template.mode === "receipt") {
    inner = `
      <text x="${inset}" y="${Math.round(height * 0.15)}" font-family="'Courier New', monospace" font-size="22" font-weight="800" letter-spacing="7" fill="${COLORS.bureauBlue}">${escapeXml(template.kicker)}</text>
      <text x="${inset}" y="${titleY}" font-family="Georgia, serif" font-size="54" font-weight="800" fill="${COLORS.navy}">${escapeXml(template.title)}</text>
      <rect x="${inset}" y="${Math.round(height * 0.34)}" width="${insetW}" height="${Math.round(height * 0.26)}" rx="18" fill="#FFFFFF" stroke="${COLORS.border}" stroke-width="3"/>
      <text x="${inset + 55}" y="${Math.round(height * 0.45)}" font-family="Arial, sans-serif" font-size="78" font-weight="900" fill="${COLORS.orange}">$1</text>
      ${bodyText(lines, inset + 190, Math.round(height * 0.42), { size: 30, lineHeight: 46, color: COLORS.navy })}
      <text x="${inset}" y="${height - 105}" font-family="'Courier New', monospace" font-size="18" font-weight="700" letter-spacing="2" fill="${COLORS.muted}">SOURCE - INTERNAL ALLOCATION REPORT</text>
      ${stampMark(template.stamp, COLORS.bureauNavy, stampX, stampY, 0.23, -7)}
    `;
  } else {
    inner = `
      <text x="${inset}" y="${Math.round(height * 0.15)}" font-family="'Courier New', monospace" font-size="22" font-weight="800" letter-spacing="7" fill="${COLORS.bureauBlue}">${escapeXml(template.kicker)}</text>
      <text x="${inset}" y="${titleY}" font-family="Georgia, serif" font-size="58" font-weight="800" fill="${COLORS.navy}">${escapeXml(template.title)}</text>
      <line x1="${inset}" y1="${titleY + 40}" x2="${width - inset}" y2="${titleY + 40}" stroke="${COLORS.bureauNavy}" stroke-width="3" opacity="0.22"/>
      ${bodyText(lines, inset, Math.round(height * 0.38), { size: 34, lineHeight: 52, family: "Georgia, serif", color: COLORS.navy, weight: 700 })}
      ${stampMark(template.stamp, template.mode === "bridge" ? COLORS.gold : COLORS.bureauNavy, stampX, stampY, 0.24, -8)}
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${textureDefs()}
  <rect width="${width}" height="${height}" fill="${template.mode === "wanted" ? COLORS.brown : "#F8FAFC"}"/>
  <rect x="${margin}" y="${paperY}" width="${safeW}" height="${paperH}" rx="22" fill="${COLORS.cream}" stroke="#D8C8A8" stroke-width="3"/>
  <rect x="${margin}" y="${paperY}" width="${safeW}" height="${paperH}" rx="22" fill="url(#paperNoise)"/>
  <text x="${width - margin}" y="${height - 38}" text-anchor="end" font-family="'Courier New', monospace" font-size="16" fill="${COLORS.muted}">${label} - ${escapeXml(template.id)}</text>
  ${inner}
</svg>`;
}

function headerSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="150" viewBox="0 0 1080 150">
  <rect width="1080" height="150" fill="none"/>
  <rect x="60" y="38" width="74" height="74" rx="18" fill="${COLORS.navy}"/>
  <text x="97" y="82" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="#fff">SHA</text>
  <text x="160" y="66" font-family="'Courier New', monospace" font-size="18" font-weight="800" letter-spacing="5" fill="${COLORS.bureauBlue}">SHARK HUMAN ALLIANCE</text>
  <text x="160" y="101" font-family="Georgia, serif" font-size="28" font-weight="700" fill="${COLORS.navy}">Bureau of Interspecies Diplomacy</text>
</svg>`;
}

function sourceLineSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="90" viewBox="0 0 1080 90">
  <rect width="1080" height="90" fill="none"/>
  <line x1="60" y1="18" x2="1020" y2="18" stroke="${COLORS.border}" stroke-width="2"/>
  <text x="60" y="58" font-family="'Courier New', monospace" font-size="20" font-weight="800" letter-spacing="2" fill="${COLORS.muted}">SOURCE - WORM ET AL. 2013 - DULVY ET AL. 2021 - FLORIDA MUSEUM ISAF</text>
</svg>`;
}

async function writeTextFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

async function writePngFromSvg(filePath, svg, density = 144) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).metadata();
  await sharp(Buffer.from(svg), { density }).png({ compressionLevel: 9 }).toFile(filePath);
}

async function generateStamps() {
  for (const stamp of STAMPS) {
    const slug = slugify(stamp);
    for (const [name, color] of Object.entries(STAMP_COLORS)) {
      const svg = stampSvg(stamp, color);
      await writeTextFile(path.join(outRoot, "stamps", "svg", `${slug}-${name}.svg`), svg);
      await writePngFromSvg(path.join(outRoot, "stamps", "png", `${slug}-${name}.png`), svg);
    }
  }
}

async function generateTextures() {
  const variants = ["clean", "stained", "ledger"];
  for (const variant of variants) {
    const svg = paperTextureSvg(1080, 1350, variant);
    await writeTextFile(path.join(outRoot, "textures", `${variant}-paper.svg`), svg);
    await writePngFromSvg(path.join(outRoot, "textures", `${variant}-paper.png`), svg);
  }
}

async function generateComponents() {
  await writeTextFile(path.join(outRoot, "components", "sha-bureau-header.svg"), headerSvg());
  await writePngFromSvg(path.join(outRoot, "components", "sha-bureau-header.png"), headerSvg());
  await writeTextFile(path.join(outRoot, "components", "source-line.svg"), sourceLineSvg());
  await writePngFromSvg(path.join(outRoot, "components", "source-line.png"), sourceLineSvg());
}

async function generateTemplates() {
  for (const template of TEMPLATES) {
    for (const [formatId, format] of Object.entries(FORMATS)) {
      const svg = templateSvg(template, format);
      const base = `${template.id}-${formatId}`;
      await writeTextFile(path.join(outRoot, "templates", "svg", `${base}.svg`), svg);
      await writePngFromSvg(path.join(outRoot, "templates", "png", `${base}.png`), svg);
    }
  }
}

async function generateMascotReadme() {
  const readme = `# Mascot Assets

Place transparent mascot cutouts and turnaround/reference exports here.

Primary source references currently live in:

- public/mascots/homepage-hero-plush.png
- public/mascots/case-closed-share.png

Do not publish mascot-heavy post graphics until the output has been checked against docs/social/mascot-model-sheet.md.
`;
  await writeTextFile(path.join(outRoot, "mascots", "README.md"), readme);
}

async function generateAssetReadme() {
  const readme = `# Social Assets

Generated by \`node scripts/generate-social-assets.mjs\`.

## Folders

- \`stamps/svg\` - editable transparent stamp SVGs.
- \`stamps/png\` - transparent stamp PNGs.
- \`textures\` - paper texture SVG/PNG backgrounds.
- \`components\` - reusable SHA Bureau header and source-line blocks.
- \`templates/svg\` - editable social templates.
- \`templates/png\` - exported preview/template PNGs in feed, square, and story formats.
- \`mascots\` - placeholder folder for mascot cutouts and reference sheets.

## Formats

- \`feed\`: 1080 x 1350
- \`square\`: 1080 x 1080
- \`story\`: 1080 x 1920

Templates are intentionally text-editable starting points. Replace placeholder copy, add approved mascot cutouts where needed, and keep fact source lines from \`docs/social/sources.md\`.
`;
  await writeTextFile(path.join(outRoot, "README.md"), readme);
}

async function main() {
  await generateStamps();
  await generateTextures();
  await generateComponents();
  await generateTemplates();
  await generateMascotReadme();
  await generateAssetReadme();
  console.log(`Generated social assets in ${path.relative(root, outRoot)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
