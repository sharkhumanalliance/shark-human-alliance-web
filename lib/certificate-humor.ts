const DIPLOMATIC_NOTES = {
  en: [
    "The holder has been classified as diplomatically uninteresting from a shark culinary perspective.",
    "The holder is not currently regarded as worth the paperwork required to eat.",
    "The Alliance has reason to believe that most sharks would simply swim past and continue minding their business.",
    "The Office sees no immediate reason to escalate this human to snack status.",
    "The holder is provisionally recognized as a low-priority snack candidate pending further marine review.",
    "No shark has formally objected to the holder's Protected Friend status at the time of issuance.",
    "The Office notes that the holder appears statistically more useful alive, framed, and mildly reassured.",
    "Marine review remains ongoing, but early reluctance appears promising.",
  ],
  es: [
    "La persona titular ha sido clasificada como diplomáticamente poco interesante desde una perspectiva culinaria tiburonesca.",
    "Por el momento no se considera que la persona titular merezca el papeleo necesario para ser comida.",
    "La Alianza tiene motivos para creer que la mayoría de los tiburones simplemente seguiría de largo y atendería sus propios asuntos.",
    "La Oficina no aprecia motivos inmediatos para escalar a esta persona a estatus de snack.",
    "La persona titular queda reconocida provisionalmente como candidata de baja prioridad para ser consumida, pendiente de nueva revisión marina.",
    "Ningún tiburón ha presentado una objeción formal al estatus de Amigo Protegido de la persona titular en la fecha de emisión.",
    "La Oficina observa que la persona titular parece estadísticamente más útil viva, enmarcada y moderadamente tranquilizada.",
    "La revisión marina sigue en curso, pero la reluctancia inicial parece prometedora.",
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

export function getCertificateHumorSeed(
  name: string,
  registryId: string,
  tier: string,
) {
  return `${name.trim()}-${registryId.trim().toLowerCase()}-${tier.trim().toLowerCase()}`;
}

export function getCertificateDiplomaticNote(input: string, locale?: string) {
  const notes = DIPLOMATIC_NOTES[getLocaleKey(locale)];
  return notes[hashString(input) % notes.length];
}

export function getCertificateFooterAside(input: string, locale?: string) {
  const asides = FOOTER_ASIDES[getLocaleKey(locale)];
  return asides[hashString(`footer-${input}`) % asides.length];
}
