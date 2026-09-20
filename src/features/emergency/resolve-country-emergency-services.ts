import type { CountryEmergencyRecord, EmergencyDatasetManifest } from "./data/emergency-dataset-schema";
import { loadEmergencyDataset } from "./data/load-emergency-dataset";

export type EmergencyVerifiedResolution =
  | {
      status: "ready";
      countryCode: string;
      record: CountryEmergencyRecord;
      manifest: EmergencyDatasetManifest;
    }
  | { status: "missing_destination" }
  | { status: "unsupported_country"; countryCode: string };

export function normalizeTripCountryCode(
  countryCode: string | null | undefined,
): string | null {
  if (!countryCode?.trim()) {
    return null;
  }
  const normalized = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) {
    return null;
  }
  return normalized;
}

export function resolveCountryEmergencyServices(
  countryCode: string | null | undefined,
): EmergencyVerifiedResolution {
  const normalized = normalizeTripCountryCode(countryCode);
  if (!normalized) {
    if (!countryCode?.trim()) {
      return { status: "missing_destination" };
    }
    return { status: "unsupported_country", countryCode: countryCode.trim().toUpperCase() };
  }

  const { countries, manifest } = loadEmergencyDataset();
  const record = countries[normalized];
  if (!record || record.services.length === 0) {
    return { status: "unsupported_country", countryCode: normalized };
  }

  return {
    status: "ready",
    countryCode: normalized,
    record,
    manifest,
  };
}
