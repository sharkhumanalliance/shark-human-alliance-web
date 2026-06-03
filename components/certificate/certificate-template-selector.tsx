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
  }> = [
    {
      value: "luxury",
      title: t("luxury.title"),
    },
    {
      value: "classic",
      title: t("classic.title"),
    },
    {
      value: "playful",
      title: t("playful.title"),
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
        </button>
      ))}
    </div>
  );
}
