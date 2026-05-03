const PROTECTED_DIPLOMATIC_NOTES = {
  en: [
    "The Alliance has reason to believe that most sharks would simply swim past and continue minding their business.",
    "Friend status does not guarantee compliance by sharks, but it does improve the paperwork situation considerably.",
    "This recognition is ceremonial, confidence-building, and best displayed where humans may feel observed by imaginary sharks.",
    "No shark has formally objected to this friendship within the applicable symbolic deadline.",
  ],
  es: [
    "La Alianza tiene motivos para creer que la mayoría de los tiburones simplemente seguiría de largo y atendería sus propios asuntos.",
    "El estatus de amistad no garantiza el cumplimiento por parte de los tiburones, pero mejora considerablemente la situación documental.",
    "Este reconocimiento es ceremonial, genera confianza y queda mejor expuesto donde los humanos puedan sentirse observados por tiburones imaginarios.",
    "Ningún tiburón ha objetado formalmente esta amistad dentro del plazo simbólico aplicable.",
  ],
} as const;

const PROTECTED_ASSESSMENTS = {
  en: [
    "The holder has been reviewed and found suitable for peaceful shark-adjacent relations.",
    "Current records indicate the holder should be regarded as a friend, not an incident.",
    "Any shark disputing this friendship is invited to file the appropriate forms, which do not currently exist.",
    "The holder is recognized as a friendly terrestrial party with no current need for marine escalation.",
  ],
  es: [
    "La persona titular ha sido revisada y considerada apta para relaciones pacíficas adyacentes a tiburones.",
    "Los registros actuales indican que la persona titular debe ser considerada una amistad, no un incidente.",
    "Todo tiburón que cuestione esta amistad queda invitado a presentar los formularios correspondientes, que actualmente no existen.",
    "La persona titular queda reconocida como parte terrestre amistosa sin necesidad actual de escalada marina.",
  ],
} as const;

const NONSNACK_ASSESSMENTS = {
  en: [
    "The holder has been reviewed and found unsuitable for snack-based classification.",
    "Available evidence suggests the holder is better understood as a person than as a light marine refreshment.",
    "Shark Human Alliance records indicate the holder should not be treated as an appetizer, entrée, or related category.",
    "The holder is not currently regarded as worth the paperwork required to eat.",
  ],
  es: [
    "La persona titular ha sido revisada y considerada inadecuada para clasificación basada en snacks.",
    "La evidencia disponible sugiere que la persona titular se entiende mejor como persona que como refrigerio marino ligero.",
    "Los registros de Shark Human Alliance indican que la persona titular no debe ser tratada como aperitivo, plato principal ni categoría relacionada.",
    "Por el momento no se considera que la persona titular merezca el papeleo necesario para ser comida.",
  ],
} as const;

const NONSNACK_DIPLOMATIC_NOTES = {
  en: [
    "Non-snack status is not a physical barrier, but it is excellent documentation.",
    "This recognition is symbolic and should not be waved at sharks without additional common sense.",
    "No shark has countersigned this document, which is consistent with ordinary marine administration.",
  ],
  es: [
    "El estatus No-Snack no es una barrera física, pero es una documentación excelente.",
    "Este reconocimiento es simbólico y no debe agitarse ante tiburones sin sentido común adicional.",
    "Ningún tiburón ha contrafirmado este documento, lo cual es coherente con la administración marina ordinaria.",
  ],
} as const;

const SHARK_FREE_ASSESSMENTS = {
  en: [
    "This location has been reviewed and found to contain insufficient ocean, inadequate prey logic, and an unreasonable amount of flooring.",
    "Any shark entering this zone would be acting outside recommended diplomatic procedure and may be asked to reconsider from a safe distance.",
    "The premises do not currently meet the minimum marine criteria for formal shark interest.",
    "Based on available evidence, sharks have elected to remain elsewhere, where conditions are wetter and paperwork is lighter.",
    "Any shark entering this zone would be operating beyond the scope of standard interspecies protocol.",
  ],
  es: [
    "Esta ubicación ha sido revisada y se ha determinado que contiene océano insuficiente, lógica de presa inadecuada y una cantidad poco razonable de suelo.",
    "Todo tiburón que entre en esta zona actuaría fuera del procedimiento diplomático recomendado y podría ser invitado a reconsiderarlo desde una distancia segura.",
    "Las instalaciones no cumplen actualmente los criterios marinos mínimos para despertar interés formal de tiburones.",
    "Según la evidencia disponible, los tiburones han elegido permanecer en otro lugar, donde las condiciones son más húmedas y el papeleo más ligero.",
    "Todo tiburón que entre en esta zona estaría operando fuera del alcance del protocolo interespecies estándar.",
  ],
} as const;

const SHARK_FREE_DIPLOMATIC_NOTES = {
  en: [
    "This certificate does not remove sharks. It merely informs them that the matter has been documented.",
    "No shark has confirmed this boundary, but several have failed to deny it.",
    "No actual shark has confirmed this boundary, which is administratively typical.",
    "Do not rely on this certificate as a flotation device, legal barrier, or marine negotiation instrument.",
    "No shark has filed a credible appetite-based claim over the premises.",
    "Any shark attempting entry would be required to complete preliminary land-walking authorization, which is not currently available.",
  ],
  es: [
    "Este certificado no elimina tiburones. Solo les informa de que el asunto ha sido documentado.",
    "Ningún tiburón ha confirmado este límite, pero varios no han logrado negarlo.",
    "Ningún tiburón real ha confirmado este límite, lo cual es administrativamente típico.",
    "No confíe en este certificado como dispositivo de flotación, barrera legal ni instrumento de negociación marina.",
    "Ningún tiburón ha presentado una reclamación alimentaria creíble sobre las instalaciones.",
    "Cualquier tiburón que intente entrar tendría que completar una autorización preliminar para caminar en tierra, que actualmente no está disponible.",
  ],
} as const;

const FOOTER_ASIDES = {
  en: [
    "To date, no shark has filed a formal objection - largely because they cannot hold a pen.",
    "The Alliance has attempted to notify the shark community. The ocean did not reply.",
    "This recognition has not been challenged by any known marine authority, mostly due to jurisdictional confusion.",
    "The holder is advised not to present this certificate to an actual shark. They will not be impressed.",
    "Printed on 100% symbolic paper. Any resemblance to actual legal protection is purely aspirational.",
    "The Department of Misunderstanding Prevention reminds you: sharks do not honor paperwork.",
  ],
  es: [
    "Hasta la fecha, ningún tiburón ha presentado una objeción formal, sobre todo porque no puede sujetar un bolígrafo.",
    "La Alianza ha intentado avisar a la comunidad tiburonesca. El océano no respondió.",
    "Este reconocimiento no ha sido impugnado por ninguna autoridad marina conocida, en gran parte por confusión jurisdiccional.",
    "Se recomienda a la persona titular no mostrar este certificado a un tiburón real. No se impresionará.",
    "Impreso en papel 100 % simbólico. Cualquier parecido con protección jurídica real es puramente aspiracional.",
    "El Departamento de Prevención de Malentendidos recuerda: los tiburones no respetan el papeleo.",
  ],
} as const;

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getLocaleKey(locale?: string) {
  return locale?.toLowerCase().startsWith("es") ? "es" : "en";
}

function isSharkFreeTier(tier?: string | null) {
  const normalized = tier?.toLowerCase() ?? "";
  return normalized === "business" || normalized.includes("zone");
}

function isNonSnackTier(tier?: string | null) {
  const normalized = tier?.toLowerCase() ?? "";
  return normalized === "nonsnack" || normalized.includes("non-snack");
}

function getAssessmentPool(locale: "en" | "es", tier?: string | null) {
  if (isNonSnackTier(tier)) {
    return NONSNACK_ASSESSMENTS[locale];
  }
  if (isSharkFreeTier(tier)) {
    return SHARK_FREE_ASSESSMENTS[locale];
  }
  return PROTECTED_ASSESSMENTS[locale];
}

export function getCertificateHumorSeed(
  name: string,
  registryId: string,
  tier: string,
) {
  return `${name.trim()}-${registryId.trim().toLowerCase()}-${tier.trim().toLowerCase()}`;
}

export function getCertificateDiplomaticAssessment(
  input: string,
  fallback: string,
  locale?: string,
  tier?: string | null,
) {
  if (!tier?.trim()) return fallback;

  const assessments = getAssessmentPool(getLocaleKey(locale), tier);
  return assessments[hashString(`assessment-${input}`) % assessments.length];
}

export function getCertificateDiplomaticNote(
  input: string,
  locale?: string,
  tier?: string | null,
) {
  const notes = isSharkFreeTier(tier)
    ? SHARK_FREE_DIPLOMATIC_NOTES[getLocaleKey(locale)]
    : isNonSnackTier(tier)
      ? NONSNACK_DIPLOMATIC_NOTES[getLocaleKey(locale)]
      : PROTECTED_DIPLOMATIC_NOTES[getLocaleKey(locale)];

  return notes[hashString(`note-${input}`) % notes.length];
}

export function getCertificateFooterAside(input: string, locale?: string) {
  const asides = FOOTER_ASIDES[getLocaleKey(locale)];
  return asides[hashString(`footer-${input}`) % asides.length];
}
