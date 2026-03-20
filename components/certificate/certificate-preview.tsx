'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';

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
}

const getTierColors = (tier: string) => {
  switch (tier) {
    case 'basic':
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
        borderColor: '#5eead4',
        accentColor: '#0d9488',
        accentBg: '#f0fdfa',
        sealColor: '#14b8a6',
        gradientFrom: '#f0fdfa',
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
    <g transform="translate(400, 300) scale(2.2)" opacity={opacity}>
      <path
        d="M-80,0 C-70,-15 -50,-25 -30,-28 C-10,-31 10,-28 25,-20 C35,-15 45,-8 55,-3 C65,2 80,5 95,3 C85,8 70,10 60,8 C50,12 40,15 30,14 C20,13 10,10 0,8 C-10,6 -25,8 -35,12 C-45,16 -55,12 -65,8 C-75,4 -85,5 -80,0Z"
        fill={color}
      />
      <path d="M-10,-28 C-5,-45 5,-50 10,-28" fill={color} />
      <path
        d="M-80,0 C-90,-12 -100,-20 -105,-25 C-95,-15 -90,-5 -80,0 C-90,5 -95,15 -105,25 C-100,20 -90,12 -80,0Z"
        fill={color}
      />
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

  // Pick one random reason from the pool (stable per name to avoid flicker)
  const selectedReason = useMemo(() => {
    if (!t.reasons || t.reasons.length === 0) return null;
    let hash = 0;
    const seed = name || 'default';
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(hash) % t.reasons.length;
    return t.reasons[idx];
  }, [name, t.reasons]);

  return (
    <div className="flex items-center justify-center">
      <div
        className="w-full max-w-lg rounded-[1.5rem] shadow-2xl relative overflow-hidden"
        style={{
          aspectRatio: '210 / 297',
          background: `linear-gradient(135deg, ${colors.gradientFrom}, ${colors.gradientTo})`,
          border: `3px solid ${colors.borderColor}`,
        }}
      >
        {/* Shark watermark background */}
        <SharkWatermark color={colors.accentColor} opacity={colors.sharkOpacity} />

        {/* Inner decorative border */}
        <div
          className="absolute inset-[6%] rounded-[0.75rem] pointer-events-none"
          style={{ border: `1px solid ${colors.borderColor}` }}
        />

        {/* Corner ornaments */}
        <div className="absolute top-[3%] left-[3%] text-base opacity-20" style={{ color: colors.accentColor }}>❖</div>
        <div className="absolute top-[3%] right-[3%] text-base opacity-20" style={{ color: colors.accentColor }}>❖</div>
        <div className="absolute bottom-[3%] left-[3%] text-base opacity-20" style={{ color: colors.accentColor }}>❖</div>
        <div className="absolute bottom-[3%] right-[3%] text-base opacity-20" style={{ color: colors.accentColor }}>❖</div>

        {/* Content — matches PDF layout order and proportions */}
        <div className="relative z-10 flex flex-col h-full px-[10%] py-[8%]" style={{ gap: '2.5%' }}>

          {/* Header */}
          <div className="text-center">
            <p
              className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase"
              style={{ color: colors.accentColor }}
            >
              {t.header}
            </p>
            <p className="mt-0.5 text-[7px] sm:text-[8px] text-gray-400 tracking-wide">
              {t.subtitle}
            </p>
            <div className="mt-1.5 mx-auto w-[35%] h-px" style={{ backgroundColor: colors.borderColor }} />
          </div>

          {/* Cert Title */}
          <div className="text-center">
            <p className="text-sm sm:text-base font-bold text-gray-800 leading-tight tracking-tight">
              {t.certTitle}
            </p>
          </div>

          {/* Certifies + Name + Status */}
          <div className="text-center">
            <p className="text-[10px] text-gray-500">
              {t.certifies}
            </p>
            <p
              className="mt-1 text-xl sm:text-2xl font-bold leading-tight"
              style={{ color: colors.accentColor }}
            >
              {name}
            </p>
            <div
              className="mt-1.5 mx-auto w-[50%] h-px"
              style={{ backgroundColor: colors.borderColor }}
            />
            <p className="mt-1.5 text-[10px] text-gray-500">{t.statusLabel}</p>
            <div className="mt-1 inline-block px-4 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase"
              style={{
                backgroundColor: colors.accentBg,
                color: colors.accentColor,
                border: `2px solid ${colors.borderColor}`,
              }}
            >
              {t.tierName}
            </div>
          </div>

          {/* Seal — mascot image */}
          <div className="flex flex-col items-center">
            <div className="relative" style={{ width: '22%' }}>
              <Image
                src="/seal.png"
                alt="SHA Seal"
                width={200}
                height={200}
                className="w-full h-auto"
              />
            </div>
            <p
              className="text-center text-[6px] sm:text-[7px] font-bold uppercase tracking-widest mt-1 max-w-[40%]"
              style={{ color: colors.sealColor }}
            >
              {t.sealText}
            </p>
          </div>

          {/* Reason */}
          {selectedReason && (
            <p className="text-center text-[10px] sm:text-[11px] leading-relaxed text-gray-600 max-w-[80%] mx-auto">
              {t.reasonsLabel}{' '}
              <span className="font-semibold" style={{ color: colors.accentColor }}>
                {selectedReason}
              </span>
            </p>
          )}

          {/* Privileges */}
          {t.privileges && (
            <p className="text-center text-[8px] sm:text-[9px] text-gray-400 italic leading-relaxed max-w-[80%] mx-auto">
              {t.privileges}
            </p>
          )}

          {/* Dedication */}
          {dedication && (
            <div className="text-center pt-1.5 mx-[8%]" style={{ borderTop: `1px solid ${colors.borderColor}` }}>
              <p className="text-[8px] text-gray-400 mb-0.5">{t.dedicationLabel}</p>
              <p className="text-[10px] text-gray-600 italic">&ldquo;{dedication}&rdquo;</p>
            </div>
          )}

          {/* Spacer to push bottom section down */}
          <div className="flex-1" />

          {/* Date + Registry — two columns */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="pt-1.5" style={{ borderTop: `1px solid ${colors.borderColor}` }}>
              <p className="text-[8px] text-gray-400 mb-0.5">{t.dateLabel}</p>
              <p className="text-[10px] font-semibold text-gray-600">{date}</p>
            </div>
            <div className="pt-1.5" style={{ borderTop: `1px solid ${colors.borderColor}` }}>
              <p className="text-[8px] text-gray-400 mb-0.5">{t.registryIdLabel}</p>
              <p className="text-[10px] font-mono font-semibold text-gray-600">{registryId}</p>
            </div>
          </div>

          {/* Validity note */}
          {t.validityNote && (
            <p className="text-center text-[7px] text-gray-400 italic">
              {t.validityNote}
            </p>
          )}

          {/* Signatures — two columns */}
          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <div className="font-serif italic text-[11px] sm:text-xs text-gray-500 mb-0.5">
                {t.sig1Name}
              </div>
              <div className="mx-auto w-[80%] h-px bg-gray-300 mb-0.5" />
              <p className="text-[7px] text-gray-400 leading-tight">
                {t.sig1Title}
              </p>
            </div>
            <div>
              <div className="font-serif italic text-[11px] sm:text-xs text-gray-500 mb-0.5">
                {t.sig2Name}
              </div>
              <div className="mx-auto w-[80%] h-px bg-gray-300 mb-0.5" />
              <p className="text-[7px] text-gray-400 leading-tight">
                {t.sig2Title}
              </p>
            </div>
          </div>

          {/* Legal disclaimer */}
          <div
            className="text-center text-[6px] sm:text-[7px] rounded-md px-3 py-1.5"
            style={{
              backgroundColor: colors.accentBg,
              border: `1px solid ${colors.borderColor}`,
              color: '#b0b8c4',
            }}
          >
            <p>{t.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
