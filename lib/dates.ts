function mapAppLocaleToDateLocale(locale: string): string {
  if (locale === "es") return "es-ES";
  return "en-US";
}

export function formatCertificateDate(
  value: Date | string | number,
  locale: string
): string {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat(mapAppLocaleToDateLocale(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
