export type TripManagementSection =
  | "details"
  | "accommodations"
  | "transport"
  | "documents"
  | "reminders"
  | "members";

export type TripManagementSectionDefinition = {
  id: TripManagementSection;
  label: string;
  shortLabel: string;
  ownerOnly: boolean;
};

export const TRIP_MANAGEMENT_SECTIONS: readonly TripManagementSectionDefinition[] =
  [
    { id: "details", label: "פרטי הטיול", shortLabel: "פרטי הטיול", ownerOnly: false },
    {
      id: "accommodations",
      label: "מקומות לינה",
      shortLabel: "לינה",
      ownerOnly: true,
    },
    { id: "transport", label: "תחבורה", shortLabel: "תחבורה", ownerOnly: false },
    { id: "documents", label: "מסמכים", shortLabel: "מסמכים", ownerOnly: true },
    { id: "reminders", label: "תזכורות", shortLabel: "תזכורות", ownerOnly: false },
    { id: "members", label: "חברי הטיול", shortLabel: "חברים", ownerOnly: false },
  ] as const;

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
  return TRIP_MANAGEMENT_SECTIONS.some((section) => section.id === value)
    ? (value as TripManagementSection)
    : null;
}

export function isOwnerOnlyManagementSection(section: TripManagementSection): boolean {
  return TRIP_MANAGEMENT_SECTIONS.find((item) => item.id === section)?.ownerOnly ?? false;
}

export function getVisibleManagementSections(isOwner: boolean) {
  return TRIP_MANAGEMENT_SECTIONS.filter(
    (section) => !section.ownerOnly || isOwner,
  );
}

export const LEGACY_SETTINGS_HASH_MAP: Record<string, TripManagementSection> = {
  accommodations: "accommodations",
  documents: "documents",
  reminders: "reminders",
};
