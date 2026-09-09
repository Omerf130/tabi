export const EMERGENCY_RESOURCE_KINDS = [
  "police",
  "ambulance_fire",
  "tourist_hotline",
  "embassy_consular",
  "other_official",
] as const;

export type EmergencyResourceKind = (typeof EMERGENCY_RESOURCE_KINDS)[number];

export type EmergencySourceMeta = {
  sourceLabel: string;
  sourceUrl: string;
  verifiedAt: string;
};

export type EmergencyResource = {
  id: string;
  kind: EmergencyResourceKind;
  title: string;
  subtitle?: string;
  description?: string;
  phone?: string;
  secondaryPhone?: string;
  internationalPhone?: string;
  email?: string;
  address?: string;
  url?: string;
  availability?: string;
  source: EmergencySourceMeta;
};

export type EmergencyPack = {
  id: string;
  countryCode: string;
  label: string;
  resources: readonly EmergencyResource[];
};

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

export type BuiltInEmergencyResourceViewModel = EmergencyResource & {
  actions: EmergencyResourceAction[];
};

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
  packId: string;
  urgentResources: BuiltInEmergencyResourceViewModel[];
  assistanceResources: BuiltInEmergencyResourceViewModel[];
  currentAccommodation: EmergencyAccommodationViewModel | null;
  documents: EmergencyDocumentViewModel[];
  customResources: TripEmergencyResourceViewModel[];
  phraseLinks: EmergencyPhraseLinkViewModel[];
  allEmergencyPhrasesHref: string;
  categoryLabels: Record<EmergencyCustomCategory, string>;
};
