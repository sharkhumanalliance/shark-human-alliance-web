"use client";

import type { CertificateTemplate } from "./certificate-document";

type Props = {
  value: CertificateTemplate;
  onChange: (value: CertificateTemplate) => void;
};

const OPTIONS: Array<{
  value: CertificateTemplate;
  title: string;
  description: string;
}> = [
  {
    value: "luxury",
    title: "Luxury Edition",
    description: "Refined premium styling with ornate framing, formal seal details, and gallery presence.",
  },
  {
    value: "hero",
    title: "Playful Official",
    description: "Bright flagship styling with mascot energy, bold contrast, and playful authority.",
  },
  {
    value: "formal",
    title: "Ceremonial Official",
    description: "Classic diplomatic styling with balanced typography, clean framing, and formal polish.",
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
          <div className="certificate-template-card__titleWrap">
            <div className="certificate-template-card__title">{option.title}</div>
          </div>
          <div className="certificate-template-card__desc">{option.description}</div>
        </button>
      ))}
    </div>
  );
}
