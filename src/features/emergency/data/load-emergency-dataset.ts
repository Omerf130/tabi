import "server-only";

import manifestJson from "./emergency-dataset-manifest.json";
import servicesJson from "./country-emergency-services.json";
import {
  countryEmergencyServicesDatasetSchema,
  type CountryEmergencyRecord,
  type EmergencyDatasetManifest,
} from "./emergency-dataset-schema";

let cached:
  | {
      manifest: EmergencyDatasetManifest;
      countries: Record<string, CountryEmergencyRecord>;
    }
  | undefined;

export function loadEmergencyDataset(): {
  manifest: EmergencyDatasetManifest;
  countries: Record<string, CountryEmergencyRecord>;
} {
  if (cached) {
    return cached;
  }

  const parsed = countryEmergencyServicesDatasetSchema.safeParse({
    manifest: manifestJson,
    countries: servicesJson.countries,
  });

  if (!parsed.success) {
    throw new Error("Invalid emergency country dataset");
  }

  cached = {
    manifest: parsed.data.manifest,
    countries: parsed.data.countries,
  };
  return cached;
}
