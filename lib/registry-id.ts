export function formatRegistryIdForDisplay(registryId: string) {
  const normalized = registryId.trim().toUpperCase();

  if (!normalized) return normalized;

  // Keep deliberate public/demo IDs as authored.
  if (normalized.startsWith("SHA-")) return normalized;

  const compact = normalized.replace(/^M-/, "").replace(/[^A-Z0-9]/g, "");
  if (compact.length < 8) return normalized;

  return `SHA-${compact.slice(0, 4)}-${compact.slice(-4)}`;
}
