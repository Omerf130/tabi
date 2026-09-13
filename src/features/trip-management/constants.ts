export type TripManagementSection =
  | "details"
  | "accommodations"
  | "transport"
  | "documents"
  | "reminders"
  | "members";

export const TRIP_MANAGEMENT_SECTION_IDS: readonly TripManagementSection[] = [
  "details",
  "accommodations",
  "transport",
  "documents",
  "reminders",
  "members",
] as const;

export const TRIP_MANAGEMENT_OWNER_ONLY_SECTIONS: readonly TripManagementSection[] =
  ["accommodations", "documents"] as const;

export const DEFAULT_TRIP_MANAGEMENT_SECTION: TripManagementSection = "details";

export function buildTripManagementHref(
  tripId: string,
  section: TripManagementSection,
): string {
  return `/app/trips/${tripId}/manage/${section}`;
}

export function parseTripManagementSection(
  value: string,
): TripManagementSection | null {
  return TRIP_MANAGEMENT_SECTION_IDS.includes(value as TripManagementSection)
    ? (value as TripManagementSection)
    : null;
}

export function isOwnerOnlyManagementSection(section: TripManagementSection): boolean {
  return TRIP_MANAGEMENT_OWNER_ONLY_SECTIONS.includes(section);
}

export const LEGACY_SETTINGS_HASH_MAP: Record<string, TripManagementSection> = {
  accommodations: "accommodations",
  documents: "documents",
  reminders: "reminders",
};
