export const DEFAULT_EMERGENCY_PACK_ID = "JP";

export const EMERGENCY_ERROR_CODES = {
  notFound: "notFound",
  validationFailed: "validationFailed",
} as const;

export type EmergencyErrorCode =
  (typeof EMERGENCY_ERROR_CODES)[keyof typeof EMERGENCY_ERROR_CODES];

export const CURATED_EMERGENCY_PHRASE_IDS = [
  "emergency.need-help",
  "emergency.ambulance",
  "emergency.hospital",
  "emergency.lost-passport",
  "emergency.police",
] as const;

export function buildEmergencyHref(tripId: string): string {
  return `/app/trips/${tripId}/emergency`;
}
