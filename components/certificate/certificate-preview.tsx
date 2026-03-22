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
}

function hashName(name: string): number {
  let hash = 0;
  const seed = name || 'default';
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  name,
  tier,
  dedication,
  date,
  registryId,
  t,
}) => {
  const selectedReason = useMemo(() => {
    if (!t.reasons || t.reasons.length === 0) return null;
    return t.reasons[hashName(name) % t.reasons.length];
  }, [name, t.reasons]);

  // Tier colours
  const accentColor =
    tier === 'nonsnack' ? '#b85c00' :
    tier === 'business' ? '#5b21b6' :
    '#1a3a5c';

  const tierBgColor =
    tier === 'nonsnack' ? '#fff3e0' :
    tier === 'business' ? '#ede9fe' :
    '#e8f0fb';

  const tierBorderColor =
    tier === 'nonsnack' ? '#f97316' :
    tier === 'business' ? '#8b5cf6' :
    '#2563eb';

  // Body text combining reason + privileges (left-aligned as in original)
  const bodyText = [
    selectedReason ? `${t.reasonsLabel} ${selectedReason}` : null,
    t.privileges || null,
  ].filter(Boolean).join(' ');

  return (
    <div className="flex items-center justify-center w-full">
      <div
        className="w-full max-w-lg shadow-2xl overflow-hidden"
        style={{
          aspectRatio: '210 / 297',
          fontFamily: 'Georgia, "Times New Roman", serif',
          position: 'relative',
        }}
      >
        {/* ══════ TOP — Shark photo (headline + tagline baked in) ══════ */}
        <div style={{ position: 'relative', height: '38%' }}>
          <Image
            src="/cert-shark.jpg"
            alt={`${t.photoHeadline} — ${t.photoTagline}`}
            fill
            className="object-cover object-top"
            sizes="(max-width: 512px) 100vw, 512px"
            priority
          />
        </div>

        {/* ══════ CERTIFICATE BODY ══════ */}
        <div
          style={{
            position: 'relative',
            height: '62%',
            background: 'linear-gradient(180deg, #eef2f7 0%, #e8edf5 40%, #eef2f7 100%)',
            display: 'flex',
            flexDirection: 'column',
            padding: '2.5% 7% 2%',
          }}
        >
          {/* Top blue accent line */}
          <div style={{
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #1a6fa0 20%, #1a6fa0 80%, transparent)',
            marginBottom: '2%',
          }} />

          {/* UNITED OCEANS DIPLOMATIC CORPS */}
          <p style={{
            textAlign: 'center',
            fontFamily: '"Arial", "Helvetica Neue", sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(7px, 1.7vw, 11.5px)',
            letterSpacing: '0.18em',
            color: '#1a3a5c',
            textTransform: 'uppercase',
            marginBottom: '0.5%',
          }}>
            {t.header}
          </p>

          {/* Subtitle */}
          <p style={{
            textAlign: 'center',
            fontFamily: '"Arial", "Helvetica Neue", sans-serif',
            fontSize: 'clamp(5.5px, 1.15vw, 7.5px)',
            color: '#6b7e94',
            marginBottom: '1.2%',
          }}>
            {t.subtitle}
          </p>

          {/* Thin divider */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #a0b4c8 20%, #a0b4c8 80%, transparent)',
            marginBottom: '1.5%',
          }} />

          {/* CERTIFICATE TITLE */}
          <p style={{
            textAlign: 'center',
            fontFamily: '"Arial", "Helvetica Neue", sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(8px, 2.1vw, 14px)',
            letterSpacing: '0.04em',
            color: '#1a3a5c',
            textTransform: 'uppercase',
            lineHeight: 1.25,
            marginBottom: '1.5%',
          }}>
            {t.certTitle}
          </p>

          {/* "This document officially certifies that the esteemed" */}
          <p style={{
            textAlign: 'center',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(5.5px, 1.2vw, 8px)',
            color: '#4a5f75',
            marginBottom: '1%',
          }}>
            {t.certifies}
          </p>

          {/* NAME + SEAL — two columns */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '3%', marginBottom: '1%' }}>

            {/* Left: name, status, tier */}
            <div style={{ flex: '1 1 60%' }}>
              {/* Name */}
              <p style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 'clamp(11px, 3vw, 20px)',
                fontWeight: 700,
                color: '#1a3a5c',
                lineHeight: 1.1,
                marginBottom: '1%',
              }}>
                {name || 'Your Name Here'}
              </p>

              {/* "has been granted the status of" */}
              <p style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontStyle: 'italic',
                fontSize: 'clamp(5.5px, 1.15vw, 7.5px)',
                color: '#4a5f75',
                marginBottom: '0.8%',
              }}>
                {t.statusLabel}
              </p>

              {/* PROTECTED FRIEND — large bold */}
              <p style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 'clamp(10px, 2.6vw, 18px)',
                fontWeight: 700,
                color: '#1a3a5c',
                lineHeight: 1.1,
              }}>
                {t.tierName}
              </p>
            </div>

            {/* Right: Seal — transparent PNG flows naturally, no box container */}
            <div style={{ flex: '0 0 42%', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
              <Image
                src="/cert-seal.png"
                alt={t.sealText}
                width={200}
                height={200}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </div>

          {/* Body text — left-aligned as in original */}
          {bodyText && (
            <p style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(5.5px, 1.15vw, 8px)',
              color: '#2c3e50',
              lineHeight: 1.45,
              marginBottom: '1.2%',
            }}>
              {bodyText}
            </p>
          )}

          {/* Dedication */}
          {dedication && (
            <p style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(5px, 1.05vw, 7px)',
              color: '#4a5f75',
              marginBottom: '1%',
            }}>
              {t.dedicationLabel}: &ldquo;{dedication}&rdquo;
            </p>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Date + Registry — two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4%', marginBottom: '1%' }}>
            <div>
              <p style={{
                fontFamily: '"Arial", "Helvetica Neue", sans-serif',
                fontSize: 'clamp(5px, 1vw, 6.5px)',
                color: '#4a5f75',
                marginBottom: '0.3%',
              }}>
                {t.dateLabel}
              </p>
              <p style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 700,
                fontSize: 'clamp(6.5px, 1.35vw, 9px)',
                color: '#1a3a5c',
              }}>
                {date}
              </p>
            </div>
            <div>
              <p style={{
                fontFamily: '"Arial", "Helvetica Neue", sans-serif',
                fontSize: 'clamp(5px, 1vw, 6.5px)',
                color: '#4a5f75',
                marginBottom: '0.3%',
              }}>
                {t.registryIdLabel}
              </p>
              <p style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 700,
                fontSize: 'clamp(6.5px, 1.35vw, 9px)',
                color: '#1a3a5c',
              }}>
                {registryId}
              </p>
            </div>
          </div>

          {/* Signatures — two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4%', marginBottom: '0.8%' }}>
            {/* Sig 1 */}
            <div>
              <p style={{
                fontFamily: '"Brush Script MT", "Segoe Script", "Dancing Script", cursive',
                fontSize: 'clamp(10px, 2.2vw, 15px)',
                color: '#1a3a5c',
                lineHeight: 1,
                marginBottom: '0.3%',
              }}>
                {t.sig1Name}
              </p>
              <div style={{ height: '1px', background: '#8a9fb5', marginBottom: '0.5%' }} />
              <p style={{
                fontFamily: '"Arial", "Helvetica Neue", sans-serif',
                fontSize: 'clamp(4.5px, 0.9vw, 6px)',
                color: '#4a5f75',
                lineHeight: 1.3,
              }}>
                {t.sig1Title}
              </p>
            </div>
            {/* Sig 2 */}
            <div>
              <p style={{
                fontFamily: '"Brush Script MT", "Segoe Script", "Dancing Script", cursive',
                fontSize: 'clamp(10px, 2.2vw, 15px)',
                color: '#1a3a5c',
                lineHeight: 1,
                marginBottom: '0.3%',
              }}>
                {t.sig2Name}
              </p>
              <div style={{ height: '1px', background: '#8a9fb5', marginBottom: '0.5%' }} />
              <p style={{
                fontFamily: '"Arial", "Helvetica Neue", sans-serif',
                fontSize: 'clamp(4.5px, 0.9vw, 6px)',
                color: '#4a5f75',
                lineHeight: 1.3,
              }}>
                {t.sig2Title}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <p style={{
            fontFamily: '"Arial", "Helvetica Neue", sans-serif',
            fontSize: 'clamp(4px, 0.75vw, 5.5px)',
            color: '#8a9fb5',
            lineHeight: 1.3,
            textAlign: 'center',
            borderTop: '1px solid #c5d5e5',
            paddingTop: '0.8%',
          }}>
            {t.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};
