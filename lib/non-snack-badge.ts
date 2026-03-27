
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function fitName(name: string): { text: string; fontSize: number } {
  const trimmed = name.trim();
  if (trimmed.length <= 18) return { text: trimmed, fontSize: 72 };
  if (trimmed.length <= 26) return { text: trimmed, fontSize: 64 };
  if (trimmed.length <= 34) return { text: trimmed, fontSize: 56 };
  return { text: trimmed, fontSize: 48 };
}

export function generateNonSnackBadgeSvg(name: string): string {
  const safeName = escapeXml(name.trim() || 'Alliance Member');
  const fitted = fitName(safeName);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="500" viewBox="0 0 1600 500" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Personalized Non-Snack badge for ${safeName}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1600" y2="500" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#08172B"/>
      <stop offset="0.55" stop-color="#0D2340"/>
      <stop offset="1" stop-color="#122B4B"/>
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(240 250) rotate(90) scale(220 220)">
      <stop stop-color="#173B63"/>
      <stop offset="1" stop-color="#0B1F37"/>
    </radialGradient>
    <linearGradient id="gold" x1="250" y1="60" x2="250" y2="440" gradientUnits="userSpaceOnUse">
      <stop stop-color="#E7D7A0"/>
      <stop offset="0.5" stop-color="#BDA46A"/>
      <stop offset="1" stop-color="#F1E3B4"/>
    </linearGradient>
    <filter id="shadow" x="0" y="0" width="1600" height="500" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="10" stdDeviation="18" flood-color="#03101D" flood-opacity="0.35"/>
    </filter>
  </defs>

  <rect x="24" y="24" width="1552" height="452" rx="28" fill="url(#bg)"/>
  <rect x="24" y="24" width="1552" height="452" rx="28" stroke="#C8AE74" stroke-opacity="0.45" stroke-width="2"/>
  <rect x="42" y="42" width="1516" height="416" rx="18" stroke="#E7D7A0" stroke-opacity="0.18" stroke-width="1.5"/>

  <g opacity="0.22">
    <path d="M58 106C270 76 438 66 656 72C850 77 1062 105 1542 84" stroke="#F4E6B2" stroke-width="2"/>
    <path d="M72 412C306 432 528 434 856 422C1096 413 1302 384 1538 392" stroke="#F4E6B2" stroke-width="2"/>
  </g>

  <g filter="url(#shadow)">
    <circle cx="250" cy="250" r="146" fill="url(#glow)" stroke="url(#gold)" stroke-width="10"/>
    <circle cx="250" cy="250" r="121" stroke="#E9DDAF" stroke-opacity="0.88" stroke-width="3"/>
    <circle cx="250" cy="250" r="100" stroke="#C8AE74" stroke-opacity="0.7" stroke-width="2"/>
    <text x="250" y="180" text-anchor="middle" fill="#EFE4BE" font-family="Georgia, 'Times New Roman', serif" font-size="26" letter-spacing="3">OFFICIALLY</text>
    <text x="250" y="212" text-anchor="middle" fill="#EFE4BE" font-family="Georgia, 'Times New Roman', serif" font-size="26" letter-spacing="3">RECOGNIZED</text>
    <text x="250" y="282" text-anchor="middle" fill="#F2E4B5" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="700">NON-SNACK</text>
    <text x="250" y="325" text-anchor="middle" fill="#D5BE84" font-family="Inter, Arial, sans-serif" font-size="20" letter-spacing="2">SHA</text>
  </g>

  <g>
    <text x="440" y="128" fill="#BFA978" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="600" letter-spacing="5">NON-SNACK RECOGNITION BADGE</text>
    <line x1="440" y1="152" x2="1450" y2="152" stroke="#D5BE84" stroke-opacity="0.45" stroke-width="1.5"/>

    <text x="440" y="248" fill="#F6EBC6" font-family="Georgia, 'Times New Roman', serif" font-size="${fitted.fontSize}" font-weight="700">${fitted.text}</text>

    <text x="440" y="316" fill="#EFE4BE" font-family="Georgia, 'Times New Roman', serif" font-size="34" font-style="italic">Officially recognized as Non-Snack</text>
    <line x1="440" y1="340" x2="1450" y2="340" stroke="#D5BE84" stroke-opacity="0.55" stroke-width="1.5"/>

    <text x="440" y="390" fill="#D9C38C" font-family="Inter, Arial, sans-serif" font-size="24" letter-spacing="1.5">Shark Human Alliance Diplomatic Registry</text>
    <text x="440" y="423" fill="#96A9BC" font-family="Inter, Arial, sans-serif" font-size="18">For profiles, signatures, and other administratively important displays.</text>
  </g>
</svg>`;
}
