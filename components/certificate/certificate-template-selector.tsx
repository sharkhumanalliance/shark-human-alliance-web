"use client";

import { useTranslations } from "next-intl";
import type { CertificateTemplate } from "./certificate-document";

type Props = {
  value: CertificateTemplate;
  onChange: (value: CertificateTemplate) => void;
};

export function CertificateTemplateSelector({ value, onChange }: Props) {
  const t = useTranslations("certificateTemplates");

  const options: Array<{
    value: CertificateTemplate;
    title: string;
    description: string;
  }> = [
    {
      value: "luxury",
      title: t("luxury.title"),
      description: t("luxury.description"),
    },
    {
      value: "formal",
      title: t("classic.title"),
      description: t("classic.description"),
    },
    {
      value: "hero",
      title: t("playful.title"),
      description: t("playful.description"),
    },
  ];

  return (
    <div className="certificate-template-selector">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`certificate-template-card${
            value === option.value ? " certificate-template-card--active" : ""
          }`}
          onClick={() => onChange(option.value)}
        >
          <div className="certificate-template-card__title">{option.title}</div>
          <div className="certificate-template-card__desc">{option.description}</div>
        </button>
      ))}
    </div>
  );
}
