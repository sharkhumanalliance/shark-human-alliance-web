'use client';

import React from 'react';

interface CertificatePreviewProps {
  name: string;
  tier: 'basic' | 'protected' | 'nonsnack' | 'business';
  dedication?: string;
  date: string;
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
}

const getTierColors = (tier: string) => {
  switch (tier) {
    case 'basic':
      return {
        borderColor: '#93c5fd',
        accentColor: '#2563eb',
        accentBg: '#eff6ff',
        sealColor: '#3b82f6',
        gradientFrom: '#eff6ff',
        gradientTo: '#ecfeff',
        sharkOpacity: '0.04',
      };
    case 'protected':
      return {
        borderColor: '#5eead4',
        accentColor: '#0d9488',
        accentBg: '#f0fdfa',
        sealColor: '#14b8a6',
        gradientFrom: '#f0fdfa',
        gradientTo: '#ecfeff',
        sharkOpacity: '0.04',
      };
    case 'nonsnack':
      return {
        borderColor: '#fdba74',
        accentColor: '#ea580c',
        accentBg: '#fff7ed',
        sealColor: '#f97316',
        gradientFrom: '#fff7ed',
        gradientTo: '#fffbeb',
        sharkOpacity: '0.04',
      };
    case 'business':
      return {
        borderColor: '#c4b5fd',
        accentColor: '#7c3aed',
        accentBg: '#f5f3ff',
        sealColor: '#8b5cf6',
        gradientFrom: '#f5f3ff',
        gradientTo: '#eef2ff',
        sharkOpacity: '0.04',
      };
    default:
      return {
        borderColor: '#93c5fd',
        accentColor: '#2563eb',
        accentBg: '#eff6ff',
        sealColor: '#3b82f6',
        gradientFrom: '#eff6ff',
        gradientTo: '#ecfeff',
        sharkOpacity: '0.04',
      };
  }
};

/* Inline SVG shark silhouette as a watermark */
const SharkWatermark = ({ color, opacity }: { color: string; opacity: string }) => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    viewBox="0 0 800 600"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    {/* Large centered shark silhouette */}
    <g transform="translate(400, 300) scale(2.2)" opacity={opacity}>
      <path
        d="M-80,0 C-70,-15 -50,-25 -30,-28 C-10,-31 10,-28 25,-20 C35,-15 45,-8 55,-3 C65,2 80,5 95,3 C85,8 70,10 60,8 C50,12 40,15 30,14 C20,13 10,10 0,8 C-10,6 -25,8 -35,12 C-45,16 -55,12 -65,8 C-75,4 -85,5 -80,0Z"
        fill={color}
      />
      {/* Dorsal fin */}
      <path
        d="M-10,-28 C-5,-45 5,-50 10,-28"
        fill={color}
      />
      {/* Tail fin */}
      <path
        d="M-80,0 C-90,-12 -100,-20 -105,-25 C-95,-15 -90,-5 -80,0 C-90,5 -95,15 -105,25 C-100,20 -90,12 -80,0Z"
        fill={color}
      />
    </g>
    {/* Small scattered sharks */}
    <g opacity={String(Number(opacity) * 0.6)}>
      <text x="120" y="100" fontSize="40" fill={color} transform="rotate(-15, 120, 100)">🦈</text>
      <text x="650" y="150" fontSize="30" fill={color} transform="rotate(10, 650, 150)">🦈</text>
      <text x="100" y="480" fontSize="28" fill={color} transform="rotate(5, 100, 480)">🦈</text>
      <text x="680" y="500" fontSize="35" fill={color} transform="rotate(-8, 680, 500)">🦈</text>
    </g>
  </svg>
);

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  name,
  tier,
  dedication,
  date,
  registryId,
  t,
}) => {
  const colors = getTierColors(tier);

  return (
    <div className="flex items-center justify-center p-4 md:p-6">
      <div
        className="w-full max-w-2xl rounded-[1.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors.gradientFrom}, ${colors.gradientTo})`,
          border: `3px solid ${colors.borderColor}`,
        }}
      >
        {/* Shark watermark background */}
        <SharkWatermark color={colors.accentColor} opacity={colors.sharkOpacity} />

        {/* Inner decorative border */}
        <div
          className="absolute inset-3 rounded-[1rem] pointer-events-none"
          style={{ border: `1px solid ${colors.borderColor}` }}
        />

        {/* Corner ornaments */}
        <div className="absolute top-5 left-5 text-lg opacity-25" style={{ color: colors.accentColor }}>❖</div>
        <div className="absolute top-5 right-5 text-lg opacity-25" style={{ color: colors.accentColor }}>❖</div>
        <div className="absolute bottom-5 left-5 text-lg opacity-25" style={{ color: colors.accentColor }}>❖</div>
        <div className="absolute bottom-5 right-5 text-lg opacity-25" style={{ color: colors.accentColor }}>❖</div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <h1
              className="text-lg md:text-xl font-bold tracking-[0.2em] uppercase mb-1"
              style={{ color: colors.accentColor }}
            >
              {t.header}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 tracking-wide">
              {t.subtitle}
            </p>
            <div className="mt-3 mx-auto w-20 h-0.5" style={{ backgroundColor: colors.borderColor }} />
          </div>

          {/* Cert Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800">
              {t.certTitle}
            </h2>
          </div>

          {/* Certifies line */}
          <p className="text-center text-sm text-gray-600 mb-3">
            {t.certifies}
          </p>

          {/* NAME — prominent */}
          <div className="text-center mb-2">
            <p
              className="text-3xl md:text-4xl font-bold"
              style={{ color: colors.accentColor }}
            >
              {name}
            </p>
            <div
              className="mt-2 mx-auto w-48 h-0.5"
              style={{ backgroundColor: colors.borderColor }}
            />
          </div>

          {/* Status label */}
          <p className="text-center text-sm text-gray-600 mt-3 mb-3">{t.statusLabel}</p>

          {/* Tier badge */}
          <div className="flex justify-center mb-6">
            <div
              className="inline-block px-5 py-2 rounded-full text-sm md:text-base font-bold tracking-wide"
              style={{
                backgroundColor: colors.accentBg,
                color: colors.accentColor,
                border: `2px solid ${colors.borderColor}`,
              }}
            >
              {t.tierName}
            </div>
          </div>

          {/* Seal */}
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-center"
              style={{
                border: `3px solid ${colors.borderColor}`,
                color: colors.sealColor,
              }}
            >
              <div>
                <div className="font-bold text-base md:text-lg leading-none">SHA</div>
                <div className="text-[7px] md:text-[8px] font-semibold uppercase leading-tight mt-1 max-w-[50px]">{t.seal}</div>
              </div>
            </div>
          </div>

          {/* Body text */}
          <p className="text-center text-xs md:text-sm text-gray-600 italic leading-relaxed mb-6 max-w-md mx-auto">
            {t.body}
          </p>

          {/* Dedication */}
          {dedication && (
            <div className="text-center mb-6 pt-3 mx-8" style={{ borderTop: `1px solid ${colors.borderColor}` }}>
              <p className="text-xs text-gray-500 mb-1">{t.dedicationLabel}</p>
              <p className="text-sm text-gray-700 italic">&ldquo;{dedication}&rdquo;</p>
            </div>
          )}

          {/* Bottom: date + registry */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6 text-center text-xs">
            <div className="pt-3" style={{ borderTop: `1px solid ${colors.borderColor}` }}>
              <p className="text-gray-500 mb-1">{t.dateLabel}</p>
              <p className="font-semibold text-gray-700">{date}</p>
            </div>
            <div className="pt-3" style={{ borderTop: `1px solid ${colors.borderColor}` }}>
              <p className="text-gray-500 mb-1">{t.registryIdLabel}</p>
              <p className="font-mono font-semibold text-gray-700">{registryId}</p>
            </div>
          </div>

          {/* Footer */}
          <div
            className="text-center text-[10px] md:text-xs rounded-lg p-3"
            style={{
              backgroundColor: colors.accentBg,
              border: `1px solid ${colors.borderColor}`,
              color: '#6b7280',
            }}
          >
            <p>{t.footer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
