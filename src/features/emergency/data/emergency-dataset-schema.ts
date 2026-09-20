import { z } from "zod";

export const EMERGENCY_SERVICE_CATEGORIES = [
  "general",
  "police",
  "ambulance",
  "fire",
  "ambulance_and_fire",
] as const;

export type EmergencyServiceCategory = (typeof EMERGENCY_SERVICE_CATEGORIES)[number];

export const emergencyServiceRowSchema = z.object({
  id: z.string().min(1),
  category: z.enum(EMERGENCY_SERVICE_CATEGORIES),
  phone: z.string().min(1),
});

export const countryEmergencyRecordSchema = z.object({
  countryCode: z.string().regex(/^[A-Z]{2}$/),
  eccFallback: z.string().nullable(),
  services: z.array(emergencyServiceRowSchema),
});

export const emergencyDatasetManifestSchema = z.object({
  sourceId: z.literal("aosp-ecc"),
  sourceRevision: z.number().int().nonnegative(),
  gitCommit: z.string().min(7),
  sourceUrl: z.string().url(),
  inputPath: z.string().min(1),
  generatedAt: z.string().min(1),
  contentSha256: z.string().regex(/^[a-f0-9]{64}$/),
  datasetImportedAt: z.string().min(1),
  stats: z.object({
    countryBlocksParsed: z.number().int().nonnegative(),
    countriesWithServices: z.number().int().nonnegative(),
    serviceRows: z.number().int().nonnegative(),
    sourceEccRowsDiscarded: z.number().int().nonnegative(),
    discardReasons: z.record(z.string(), z.number().int().nonnegative()),
    dedupeMergedPhones: z.number().int().nonnegative(),
  }),
});

export const countryEmergencyServicesDatasetSchema = z.object({
  manifest: emergencyDatasetManifestSchema,
  countries: z.record(z.string(), countryEmergencyRecordSchema),
});

export type EmergencyServiceRow = z.infer<typeof emergencyServiceRowSchema>;
export type CountryEmergencyRecord = z.infer<typeof countryEmergencyRecordSchema>;
export type EmergencyDatasetManifest = z.infer<typeof emergencyDatasetManifestSchema>;
export type CountryEmergencyServicesDataset = z.infer<
  typeof countryEmergencyServicesDatasetSchema
>;
