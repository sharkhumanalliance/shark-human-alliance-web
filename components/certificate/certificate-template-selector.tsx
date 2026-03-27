"use client";

import type { CertificateTemplate } from "./certificate-document";

type Props = {
  value: CertificateTemplate;
  onChange: (value: CertificateTemplate) => void;
};

const OPTIONS: Array<{
  value: CertificateTemplate;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: "hero",
    label: "Playful Official",
    description: "Bold and fun — with the iconic shark-floor photo.",
    icon: "🦈",
  },
  {
    value: "formal",
    label: "Ceremonial Official",
    description: "Elegant and frameable — pure diplomatic ceremony.",
    icon: "📜",
  },
  {
    value: "luxury",
    label: "Luxury Edition",
    description: "Premium framed design with ornate borders and seal.",
    icon: "🏅",
  },
];

export function CertificateTemplateSelector({ value, onChange }: Props) {
  return (
    <div className="certificate-template-selector">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`certificate-template-card${
            value === option.value ? " certificate-template-card--active" : ""
          }`}
          onClick={() => onChange(option.value)}
        >
          <div className="certificate-template-card__title">
            {option.icon} {option.label}
          </div>
          <div className="certificate-template-card__desc">
            {option.description}
          </div>
        </button>
      ))}
    </div>
  );
}
