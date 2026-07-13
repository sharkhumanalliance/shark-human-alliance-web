const PROTECTED_DIPLOMATIC_NOTES = {
  en: [
    "The Alliance has reason to believe that most sharks would simply swim past and continue minding their business.",
    "Friend status does not guarantee compliance by sharks, but it does improve the paperwork situation considerably.",
    "This recognition is ceremonial, confidence-building, and best displayed where humans may feel observed by imaginary sharks.",
    "No shark has formally objected to this friendship within the applicable symbolic deadline.",
    "Following a routine review, the holder has been cleared of all seafood-adjacent suspicions raised to date.",
    "The Bureau finds the holder demonstrably easier to befriend than to catalogue.",
    "Field observations confirm the holder waves at the ocean in a manner consistent with diplomacy.",
    "No credible evidence places the holder on any marine menu, draft or final.",
  ],
  es: [
    "La Alianza tiene motivos para creer que la mayoría de los tiburones simplemente seguiría de largo y atendería sus propios asuntos.",
    "El estatus de amistad no garantiza el cumplimiento por parte de los tiburones, pero mejora considerablemente la situación documental.",
    "Este reconocimiento es ceremonial, genera confianza y queda mejor expuesto donde los humanos puedan sentirse observados por tiburones imaginarios.",
    "Ningún tiburón ha objetado formalmente esta amistad dentro del plazo simbólico aplicable.",
    "Tras una revisión rutinaria, la persona titular ha quedado libre de toda sospecha relacionada con productos del mar planteada hasta la fecha.",
    "La Oficina concluye que resulta notablemente más fácil entablar amistad con la persona titular que catalogarla.",
    "Las observaciones de campo confirman que la persona titular saluda al océano de un modo coherente con la diplomacia.",
    "Ninguna evidencia creíble sitúa a la persona titular en menú marino alguno, ni en borrador ni definitivo.",
  ],
} as const;

const PROTECTED_ASSESSMENTS = {
  en: [
    "The holder has been reviewed and found unlikely to escalate shark-human relations before lunch.",
    "Current records indicate the holder should be regarded as a friend, not an incident.",
    "Any shark disputing this friendship is invited to file the appropriate forms, which do not currently exist.",
    "The holder is recognized as a friendly terrestrial party with no current need for marine escalation.",
    "Sharks remain unaware of this document, which has never once reduced its ceremonial power.",
    "The friendship documented here is unilateral, which the Alliance considers a promising start.",
    "In the unlikely event of a shark encounter, the holder is advised to lead with personality, not paperwork.",
    "This certificate has been filed with the ocean's administrative department, pending the ocean opening one.",
    "Renewal is automatic, perpetual, and entirely imaginary.",
  ],
  es: [
    "La persona titular ha sido revisada y considerada poco propensa a escalar las relaciones tiburón-humanas antes del almuerzo.",
    "Los registros actuales indican que la persona titular debe ser considerada una amistad, no un incidente.",
    "Todo tiburón que cuestione esta amistad queda invitado a presentar los formularios correspondientes, que actualmente no existen.",
    "La persona titular queda reconocida como parte terrestre amistosa sin necesidad actual de escalada marina.",
    "Los tiburones siguen sin conocer este documento, lo cual jamás ha reducido su poder ceremonial.",
    "La amistad aquí documentada es unilateral, lo que la Alianza considera un comienzo prometedor.",
    "En el improbable caso de un encuentro con tiburón, se recomienda a la persona titular recurrir a su personalidad, no al papeleo.",
    "Este certificado ha sido presentado ante el departamento administrativo del océano, a la espera de que el océano abra uno.",
    "La renovación es automática, perpetua y enteramente imaginaria.",
  ],
} as const;

const NONSNACK_ASSESSMENTS = {
  en: [
    "The holder has been reviewed and found unsuitable for snack-based classification.",
    "Available evidence suggests the holder is better understood as a person than as a light marine refreshment.",
    "Shark Human Alliance records indicate the holder should not be treated as an appetizer, entrée, or related category.",
    "The holder is not currently regarded as worth the paperwork required to eat.",
    "After careful measurement, the Bureau concludes the holder exceeds all recognized snack dimensions, chiefly in personality.",
    "The holder's non-snack status was approved without objection, which is rare and slightly suspicious.",
    "An exploratory committee found no nutritional argument for the holder whatsoever.",
    "Records show the holder is filed under 'colleagues', a category sharks respect administratively.",
  ],
  es: [
    "La persona titular ha sido revisada y considerada inadecuada para clasificación basada en snacks.",
    "La evidencia disponible sugiere que la persona titular se entiende mejor como persona que como refrigerio marino ligero.",
    "Los registros de Shark Human Alliance indican que la persona titular no debe ser tratada como aperitivo, plato principal ni categoría relacionada.",
    "Por el momento no se considera que la persona titular merezca el papeleo necesario para ser comida.",
    "Tras una medición cuidadosa, la Oficina concluye que la persona titular excede todas las dimensiones de snack reconocidas, principalmente en personalidad.",
    "El estatus No-Snack de la persona titular fue aprobado sin objeciones, lo cual es raro y ligeramente sospechoso.",
    "Un comité exploratorio no encontró argumento nutricional alguno a favor de la persona titular.",
    "Los registros muestran que la persona titular está archivada bajo 'colegas', una categoría que los tiburones respetan administrativamente.",
  ],
} as const;

const NONSNACK_DIPLOMATIC_NOTES = {
  en: [
    "Non-snack status is not a physical barrier, but it is excellent documentation.",
    "This recognition is symbolic and should not be waved at sharks without additional common sense.",
    "No shark has countersigned this document, which is consistent with ordinary marine administration.",
    "Non-snack status is permanent, non-transferable, and entirely wasted on sharks, who cannot read.",
    "The Bureau notes that declaring oneself inedible is legally meaningless and spiritually excellent.",
    "This document elevates the holder from 'probably fine' to 'formally not food'.",
    "In case of dispute, the burden of proof rests fully on the shark.",
    "The Department of Misunderstanding Prevention has pre-approved all of the holder's future beach visits, administratively speaking.",
  ],
  es: [
    "El estatus No-Snack no es una barrera física, pero es una documentación excelente.",
    "Este reconocimiento es simbólico y no debe agitarse ante tiburones sin sentido común adicional.",
    "Ningún tiburón ha contrafirmado este documento, lo cual es coherente con la administración marina ordinaria.",
    "El estatus No-Snack es permanente, intransferible y completamente desperdiciado en los tiburones, que no saben leer.",
    "La Oficina señala que declararse incomestible es jurídicamente irrelevante y espiritualmente excelente.",
    "Este documento eleva a la persona titular de 'probablemente bien' a 'formalmente no comida'.",
    "En caso de disputa, la carga de la prueba recae íntegramente en el tiburón.",
    "El Departamento de Prevención de Malentendidos ha preaprobado todas las futuras visitas a la playa de la persona titular, administrativamente hablando.",
  ],
} as const;

const SHARK_FREE_ASSESSMENTS = {
  en: [
    "This location has been reviewed and found to contain insufficient ocean, inadequate prey logic, and an unreasonable amount of flooring.",
    "Any shark entering this zone would be acting outside recommended diplomatic procedure and may be asked to reconsider from a safe distance.",
    "The premises do not currently meet the minimum marine criteria for formal shark interest.",
    "Based on available evidence, sharks have elected to remain elsewhere, where conditions are wetter and paperwork is lighter.",
    "Any shark entering this zone would be operating beyond the scope of standard interspecies protocol.",
    "A site inspection confirmed the premises contain chairs, opinions, and no measurable surf.",
    "The zone's shark population has been audited and found to equal zero, pending seasonal review.",
    "Local water sources were examined and declared too small, too chlorinated, or too decorative for shark habitation.",
    "The Bureau certifies these premises as administratively unappetizing.",
  ],
  es: [
    "Esta ubicación ha sido revisada y se ha determinado que contiene océano insuficiente, lógica de presa inadecuada y una cantidad poco razonable de suelo.",
    "Todo tiburón que entre en esta zona actuaría fuera del procedimiento diplomático recomendado y podría ser invitado a reconsiderarlo desde una distancia segura.",
    "Las instalaciones no cumplen actualmente los criterios marinos mínimos para despertar interés formal de tiburones.",
    "Según la evidencia disponible, los tiburones han elegido permanecer en otro lugar, donde las condiciones son más húmedas y el papeleo más ligero.",
    "Todo tiburón que entre en esta zona estaría operando fuera del alcance del protocolo interespecies estándar.",
    "Una inspección del lugar confirmó que las instalaciones contienen sillas, opiniones y ningún oleaje medible.",
    "La población de tiburones de la zona ha sido auditada y resulta igual a cero, pendiente de revisión estacional.",
    "Las fuentes de agua locales fueron examinadas y declaradas demasiado pequeñas, demasiado cloradas o demasiado decorativas para albergar tiburones.",
    "La Oficina certifica estas instalaciones como administrativamente poco apetitosas.",
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
    "Zone status must be displayed prominently, ideally at shark eye level, wherever that turns out to be.",
    "The Bureau accepts no liability for sharks arriving by delivery, prank, or aquarium.",
    "This zone's certification survives renovations, relocations, and most team-building events.",
  ],
  es: [
    "Este certificado no elimina tiburones. Solo les informa de que el asunto ha sido documentado.",
    "Ningún tiburón ha confirmado este límite, pero varios no han logrado negarlo.",
    "Ningún tiburón real ha confirmado este límite, lo cual es administrativamente típico.",
    "No confíe en este certificado como dispositivo de flotación, barrera legal ni instrumento de negociación marina.",
    "Ningún tiburón ha presentado una reclamación alimentaria creíble sobre las instalaciones.",
    "Cualquier tiburón que intente entrar tendría que completar una autorización preliminar para caminar en tierra, que actualmente no está disponible.",
    "El estatus de zona debe exhibirse en lugar destacado, idealmente a la altura de los ojos de un tiburón, dondequiera que eso resulte estar.",
    "La Oficina no asume responsabilidad por tiburones que lleguen por mensajería, broma o acuario.",
    "La certificación de esta zona sobrevive a reformas, mudanzas y a la mayoría de los eventos de team building.",
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
    "Certified paperwork travels poorly underwater. Frame accordingly.",
    "Luna Reef has reviewed this document twice. The second time was personal.",
    "Finnley Mako insisted on the serif font. The Bureau chose its battles.",
    "Complaints may be addressed to the ocean, in writing, at low tide.",
  ],
  es: [
    "Hasta la fecha, ningún tiburón ha presentado una objeción formal, sobre todo porque no puede sujetar un bolígrafo.",
    "La Alianza ha intentado avisar a la comunidad tiburonesca. El océano no respondió.",
    "Este reconocimiento no ha sido impugnado por ninguna autoridad marina conocida, en gran parte por confusión jurisdiccional.",
    "Se recomienda a la persona titular no mostrar este certificado a un tiburón real. No se impresionará.",
    "Impreso en papel 100 % simbólico. Cualquier parecido con protección jurídica real es puramente aspiracional.",
    "El Departamento de Prevención de Malentendidos recuerda: los tiburones no respetan el papeleo.",
    "El papeleo certificado viaja mal bajo el agua. Enmarcar en consecuencia.",
    "Luna Reef ha revisado este documento dos veces. La segunda fue personal.",
    "Finnley Mako insistió en la tipografía serif. La Oficina eligió sus batallas.",
    "Las quejas pueden dirigirse al océano, por escrito, con marea baja.",
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
  // The registry id is intentionally excluded from the seed. Purchase previews
  // render with a placeholder id before checkout, while issued certificates use
  // the final public registry id; basing humor on the id would make the
  // previewed note differ from the delivered certificate for the same name.
  void registryId;
  return `${name.trim().toLowerCase()}-${tier.trim().toLowerCase()}`;
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
