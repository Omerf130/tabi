import type { EmergencyServiceCategory } from "./data/emergency-dataset-schema";

export const EMERGENCY_CUSTOM_CATEGORIES = [
  "insurance",
  "medical",
  "personal_contact",
  "financial",
  "transport",
  "local_contact",
  "other",
] as const;

export type EmergencyCustomCategory = (typeof EMERGENCY_CUSTOM_CATEGORIES)[number];

export type EmergencyResourceAction =
  | { type: "phone"; label: string; href: string; value: string }
  | { type: "email"; label: string; href: string; value: string }
  | { type: "url"; label: string; href: string; value: string }
  | { type: "address"; label: string; href: string; value: string }
  | { type: "copy"; label: string; value: string };

export type VerifiedEmergencyServiceViewModel = {
  id: string;
  category: EmergencyServiceCategory;
  phone: string;
  actions: EmergencyResourceAction[];
};

export type EmergencyDatasetSourceViewModel = {
  sourceId: string;
  sourceRevision: number;
  datasetImportedAt: string;
  gitCommit: string;
};

export type EmergencyVerifiedViewModel =
  | {
      status: "ready";
      countryCode: string;
      services: VerifiedEmergencyServiceViewModel[];
      source: EmergencyDatasetSourceViewModel;
    }
  | { status: "missing_destination" }
  | { status: "unsupported_country"; countryCode?: string };

export type TripEmergencyResourceViewModel = {
  id: string;
  tripId: string;
  category: EmergencyCustomCategory;
  categoryLabel: string;
  title: string;
  phone?: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;
  url?: string;
  reference?: string;
  notes?: string;
  createdBy: string;
  actions: EmergencyResourceAction[];
};

export type EmergencyAccommodationViewModel = {
  id: string;
  name: string;
  city?: string;
  address?: string;
  detailHref: string;
  taxiHref: string;
  mapsHref?: string;
};

export type EmergencyPhraseLinkViewModel = {
  id: string;
  sourceText: string;
  detailHref: string;
};

export type EmergencyDocumentViewModel = {
  id: string;
  title: string;
  categoryLabel: string;
  detailHref: string;
  fileHref: string;
};

export type EmergencyPageViewModel = {
  tripId: string;
  verified: EmergencyVerifiedViewModel;
  tripDetailsHref: string;
  currentAccommodation: EmergencyAccommodationViewModel | null;
  documents: EmergencyDocumentViewModel[];
  customResources: TripEmergencyResourceViewModel[];
  phraseLinks: EmergencyPhraseLinkViewModel[];
  allEmergencyPhrasesHref: string;
  categoryLabels: Record<EmergencyCustomCategory, string>;
};
