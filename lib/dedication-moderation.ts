const DEDICATION_MAX_LENGTH = 140;

const BLOCKED_PHRASES = [
  "kill yourself",
  "go kill yourself",
  "heil hitler",
  "white power",
  "nigger",
  "faggot",
  "retard",
  "rape",
];

export class DedicationModerationError extends Error {
  constructor(
    public readonly code:
      | "dedication_too_long"
      | "dedication_contains_contact"
      | "dedication_contains_url"
      | "dedication_rejected"
  ) {
    super(code);
    this.name = "DedicationModerationError";
  }
}

export function moderateDedication(input: string | null | undefined) {
  const normalized = (input ?? "").trim().replace(/\s+/g, " ");
  if (!normalized) {
    return {
      dedication: "",
      reviewStatus: "approved" as const,
    };
  }

  if (normalized.length > DEDICATION_MAX_LENGTH) {
    throw new DedicationModerationError("dedication_too_long");
  }

  if (/(https?:\/\/|www\.)/i.test(normalized)) {
    throw new DedicationModerationError("dedication_contains_url");
  }

  if (
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(normalized) ||
    /(\+?\d[\d\s().-]{7,}\d)/.test(normalized)
  ) {
    throw new DedicationModerationError("dedication_contains_contact");
  }

  const lowered = normalized.toLowerCase();
  if (BLOCKED_PHRASES.some((phrase) => lowered.includes(phrase))) {
    throw new DedicationModerationError("dedication_rejected");
  }

  return {
    dedication: normalized,
    reviewStatus: "approved" as const,
  };
}

