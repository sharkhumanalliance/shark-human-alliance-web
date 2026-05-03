type LocaleKey = "en" | "es";
type TierKey = "protected" | "nonsnack" | "business";

const COPY = {
  en: {
    certificate: "Certificate",
    of: "of",
    officialRecognition: "Official Recognition",
    issuedBy: "Issued by the",
    organization: "Shark Human Alliance",
    department: "Department of Interspecies Diplomacy",
    verificationDetails: "Verification details",
    verify: "Verify",
    verifyMembership: "Verify membership",
    earnedLine1: "has earned the trust and respect of the wider marine",
    earnedLine2: "community and is hereby declared a:",
    body:
      "This certifies that the holder is officially recognized by the Shark Human Alliance as a supporter of peaceful shark-human relations and a contributor to real ocean conservation.",
    recognized: "Recognized",
    registry: "Registry",
    dateOfRecognition: "Date of Recognition",
    registryId: "Registry ID",
    filedUnder: "Filed Under",
    filedUnderPrefix: "Filed under",
    finnleyRole: "Shark Spokesperson",
    lunaRole: "Dept. of Misunderstanding Prevention",
    finnleyPlayfulRole: "Chief Diplomatic SHA & Press Spokesperson",
    finnleyPlayfulAside: "(and Optimist)",
    lunaPlayfulRole: "Head of Culinary Inspection &",
    lunaPlayfulAside: "Dept. of Misunderstanding Prevention",
    symbolicDisclaimer:
      "This document is officially symbolic and diplomatically non-binding. Sharks cannot read, do not recognize human bureaucracy, and remain largely unaware of our existence. Your purchase supports real ocean conservation - which is more than most certificates can say.",
    playfulIntro: "This certifies that",
    playfulStatusLabel: "has been officially recognized as a",
    /* Mirrors `body` so every certificate carries the same message. The
       phrasing is shifted to read as a continuation of the tier line above
       (e.g. "...recognized as a PROTECTED FRIEND by the Shark Human Alliance,
       as a supporter of...") — no redundant "This certifies that". */
    playfulBody:
      "by the Shark Human Alliance, as a supporter of peaceful shark-human relations and a contributor to real ocean conservation.",
    statusLabels: {
      protected: "has been officially recognized as a",
      nonsnack: "has been officially classified as",
      business: "has been officially designated as a",
    },
    bodies: {
      protected:
        "by the Shark Human Alliance, as a supporter of peaceful shark-human relations and a contributor to real ocean conservation.",
      nonsnack:
        "by the Shark Human Alliance, on the basis that current records do not support treating the holder as food and in recognition of support for real ocean conservation.",
      business:
        "by the Shark Human Alliance, after confirming that no shark has presented documentation sufficient to challenge the zone designation, and in recognition of substantial support for real ocean conservation.",
    },
    assessmentLabel: "Diplomatic assessment",
    assessmentText:
      "Any shark considering the holder a meal would be demonstrating exceptionally poor judgment.",
    dedicationLabel: "Recorded dedication",
    marineNoteLabel: "Supplementary marine note",
    tierLabels: {
      protected: "Protected Friend",
      nonsnack: "Certified Non-Snack",
      business: "Shark-Free Zone",
    },
    ribbonLabels: {
      protected: "Protected Friend Status",
      nonsnack: "Non-Snack Status",
      business: "Shark-Free Status",
    },
    filedUnderLabels: {
      protected: "Optimistic Marine Paperwork",
      nonsnack: "Non-Snack Diplomacy",
      business: "Shark-Free Paperwork",
    },
  },
  es: {
    certificate: "Certificado",
    of: "de",
    officialRecognition: "Reconocimiento Oficial",
    issuedBy: "Emitido por la",
    organization: "Shark Human Alliance",
    department: "Departamento de Diplomacia Interespecies",
    verificationDetails: "Detalles de verificación",
    verify: "Verificar",
    verifyMembership: "Verificar membresía",
    earnedLine1: "ha obtenido la confianza y el respeto de la comunidad marina",
    earnedLine2: "y queda declarado/a:",
    body:
      "Este documento certifica que la persona titular queda oficialmente reconocida por Shark Human Alliance como promotora de relaciones pacíficas tiburón-humanas y contribuyente a la conservación oceánica real.",
    recognized: "Reconocido",
    registry: "Registro",
    dateOfRecognition: "Fecha de reconocimiento",
    registryId: "ID de registro",
    filedUnder: "Archivado como",
    filedUnderPrefix: "Archivado como",
    finnleyRole: "Portavoz tiburón",
    lunaRole: "Depto. de Prevención de Malentendidos",
    finnleyPlayfulRole: "Jefe Diplomático SHA y Portavoz",
    finnleyPlayfulAside: "(y optimista)",
    lunaPlayfulRole: "Jefa de Inspección Culinaria y",
    lunaPlayfulAside: "Depto. de Prevención de Malentendidos",
    symbolicDisclaimer:
      "Este documento es oficialmente simbólico y diplomáticamente no vinculante. Los tiburones no saben leer, no reconocen la burocracia humana y, en general, desconocen nuestra existencia. Tu compra apoya conservación oceánica real - que ya es más de lo que pueden decir la mayoría de certificados.",
    playfulIntro: "Esto certifica que",
    playfulStatusLabel: "ha sido reconocido/a oficialmente como",
    /* Refleja `body` — mismo mensaje en todos los certificados, redactado
       como continuación de la línea del tier para evitar duplicar
       "Esto certifica que". */
    playfulBody:
      "por Shark Human Alliance, como promotor/a de relaciones pacíficas tiburón-humanas y contribuyente a la conservación oceánica real.",
    statusLabels: {
      protected: "ha sido reconocido/a oficialmente como",
      nonsnack: "ha sido clasificado/a oficialmente como",
      business: "ha sido designado/a oficialmente como",
    },
    bodies: {
      protected:
        "por Shark Human Alliance, como promotor/a de relaciones pacíficas tiburón-humanas y contribuyente a la conservación oceánica real.",
      nonsnack:
        "por Shark Human Alliance, dado que los registros actuales no respaldan tratar a la persona titular como alimento y en reconocimiento del apoyo a la conservación oceánica real.",
      business:
        "por Shark Human Alliance, tras confirmar que ningún tiburón ha presentado documentación suficiente para impugnar la designación de la zona y en reconocimiento del apoyo significativo a la conservación oceánica real.",
    },
    assessmentLabel: "Evaluación diplomática",
    assessmentText:
      "Cualquier tiburón que considerara a la persona titular como comida demostraría un criterio excepcionalmente pobre.",
    dedicationLabel: "Dedicatoria registrada",
    marineNoteLabel: "Nota marina suplementaria",
    tierLabels: {
      protected: "Amigo Protegido",
      nonsnack: "No-Snack Certificado",
      business: "Zona Libre de Tiburones",
    },
    ribbonLabels: {
      protected: "Estatus de Amigo Protegido",
      nonsnack: "Estatus No-Snack",
      business: "Estatus Zona Libre",
    },
    filedUnderLabels: {
      protected: "Papeleo marino optimista",
      nonsnack: "Diplomacia No-Snack",
      business: "Papeleo Zona Libre",
    },
  },
} as const;

export function getCertificateLocale(locale?: string): LocaleKey {
  return locale?.toLowerCase().startsWith("es") ? "es" : "en";
}

export function getCertificateTierKey(tier: string): TierKey {
  const normalized = tier?.toLowerCase() ?? "";
  if (normalized === "nonsnack" || normalized.includes("non-snack")) {
    return "nonsnack";
  }
  if (normalized === "business" || normalized.includes("zone")) {
    return "business";
  }
  return "protected";
}

export function getCertificateDisplayCopy(locale?: string) {
  return COPY[getCertificateLocale(locale)];
}
