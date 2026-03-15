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
        border: 'border-blue-300',
        accent: 'text-blue-600',
        accentBg: 'bg-blue-50',
        seal: 'text-blue-500',
        gradient: 'from-blue-50 to-cyan-50',
      };
    case 'protected':
      return {
        border: 'border-teal-300',
        accent: 'text-teal-600',
        accentBg: 'bg-teal-50',
        seal: 'text-teal-500',
        gradient: 'from-teal-50 to-cyan-50',
      };
    case 'nonsnack':
      return {
        border: 'border-orange-300',
        accent: 'text-orange-600',
        accentBg: 'bg-orange-50',
        seal: 'text-orange-500',
        gradient: 'from-orange-50 to-amber-50',
      };
    case 'business':
      return {
        border: 'border-purple-300',
        accent: 'text-purple-600',
        accentBg: 'bg-purple-50',
        seal: 'text-purple-500',
        gradient: 'from-purple-50 to-indigo-50',
      };
    default:
      return {
        border: 'border-blue-300',
        accent: 'text-blue-600',
        accentBg: 'bg-blue-50',
        seal: 'text-blue-500',
        gradient: 'from-blue-50 to-cyan-50',
      };
  }
};

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
    <div className="flex items-center justify-center bg-gray-100 p-4 md:p-8">
      <div
        className={`w-full max-w-2xl bg-gradient-to-br ${colors.gradient} rounded-[2rem] p-8 md:p-12 shadow-2xl border-4 ${colors.border} relative`}
      >
        {/* Decorative corner ornaments */}
        <div className="absolute top-4 left-4 text-2xl md:text-3xl opacity-20">✦</div>
        <div className="absolute top-4 right-4 text-2xl md:text-3xl opacity-20">✦</div>
        <div className="absolute bottom-4 left-4 text-2xl md:text-3xl opacity-20">✦</div>
        <div className="absolute bottom-4 right-4 text-2xl md:text-3xl opacity-20">✦</div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-2xl md:text-3xl font-bold ${colors.accent} mb-2`}>
            {t.header}
          </h1>
          <p className={`text-sm md:text-base ${colors.accent} opacity-75`}>
            {t.subtitle}
          </p>
        </div>

        {/* Main Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-2">
            {t.certTitle}
          </h2>
          <div className={`h-1 w-24 ${colors.accentBg} mx-auto`}></div>
        </div>

        {/* Seal Area */}
        <div className="flex justify-center mb-8">
          <div
            className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 ${colors.border} flex items-center justify-center ${colors.seal} text-center`}
          >
            <div className="text-center">
              <div className="font-bold text-lg md:text-xl">SHA</div>
              <div className="text-xs font-semibold">{t.seal}</div>
            </div>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="text-center mb-8">
          <p className="text-sm md:text-base text-gray-700 mb-6 leading-relaxed">
            {t.certifies}
          </p>

          {/* Name - Prominent */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm md:text-base mb-2">{t.statusLabel}</p>
            <p className={`text-3xl md:text-4xl font-bold ${colors.accent}`}>
              {name}
            </p>
          </div>

          {/* Tier Status */}
          <div className={`inline-block ${colors.accentBg} px-4 md:px-6 py-2 rounded-full mb-6 border ${colors.border}`}>
            <span className={`text-sm md:text-base font-semibold ${colors.accent}`}>
              {t.tierName}: <span className="font-bold">{tier.toUpperCase()}</span>
            </span>
          </div>

          {/* Body Text */}
          <p className="text-sm md:text-base text-gray-700 mt-6 mb-6 italic leading-relaxed">
            {t.body}
          </p>

          {/* Dedication (if provided) */}
          {dedication && (
            <div className="mb-6 pt-4 border-t-2 border-gray-300">
              <p className="text-xs md:text-sm text-gray-600 mb-2">{t.dedicationLabel}</p>
              <p className="text-sm md:text-base text-gray-700 italic">"{dedication}"</p>
            </div>
          )}
        </div>

        {/* Bottom Information */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8 text-center text-xs md:text-sm">
          <div className="border-t-2 border-gray-400 pt-4">
            <p className="text-gray-600 mb-2">{t.dateLabel}</p>
            <p className="font-semibold text-gray-800">{date}</p>
          </div>
          <div className="border-t-2 border-gray-400 pt-4">
            <p className="text-gray-600 mb-2">{t.registryIdLabel}</p>
            <p className="font-mono font-semibold text-gray-800">{registryId}</p>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className={`text-center text-xs md:text-sm ${colors.accentBg} rounded-lg p-3 md:p-4 border ${colors.border}`}>
          <p className="text-gray-700 leading-relaxed">{t.footer}</p>
        </div>

        {/* Decorative line bottom */}
        <div className={`mt-6 h-1 w-full ${colors.accentBg}`}></div>
      </div>
    </div>
  );
};
