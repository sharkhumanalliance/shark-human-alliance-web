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
    value: "luxury",
    label: "Luxury Edition",
    description: "Refined premium styling with ornate framing, a formal seal, and gallery presence.",
    icon: "🏅",
  },
  {
    value: "formal",
    label: "Ceremonial Official",
    description: "Classic diplomatic styling with balanced typography, clean framing, and formal polish.",
    icon: "📜",
  },
  {
    value: "hero",
    label: "Playful Official",
    description: "Brighter flagship styling with mascot energy, bold contrast, and playful authority.",
    icon: "🦈",
  },
];

export function CertificateTemplateSelector({ value, onChange }: Props) {
  return (
    <div className="certificate-template-selector" role="radiogroup" aria-label="Certificate style selector">
      {OPTIONS.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-pressed={isActive}
            className={`certificate-template-card${
              isActive ? " certificate-template-card--active" : ""
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
        );
      })}
    </div>
  );
}
