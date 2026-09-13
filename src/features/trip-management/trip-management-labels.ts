import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { TripManagementSection } from "./constants";

export type TripManagementSectionDefinition = {
  id: TripManagementSection;
  label: string;
  shortLabel: string;
  ownerOnly: boolean;
};

const TRIP_MANAGEMENT_SECTION_META: readonly {
  id: TripManagementSection;
  ownerOnly: boolean;
}[] = [
  { id: "details", ownerOnly: false },
  { id: "accommodations", ownerOnly: true },
  { id: "transport", ownerOnly: false },
  { id: "documents", ownerOnly: true },
  { id: "reminders", ownerOnly: false },
  { id: "members", ownerOnly: false },
] as const;

export function createTripManagementSections(
  t: AppTranslator<"TripManagement">,
): readonly TripManagementSectionDefinition[] {
  return TRIP_MANAGEMENT_SECTION_META.map(({ id, ownerOnly }) => ({
    id,
    label: t(`sections.${id}.label`),
    shortLabel: t(`sections.${id}.shortLabel`),
    ownerOnly,
  }));
}

export function getTripManagementSectionLabel(
  section: TripManagementSection,
  t: AppTranslator<"TripManagement">,
): string {
  return t(`sections.${section}.label`);
}

export function getVisibleManagementSections(
  isOwner: boolean,
  t: AppTranslator<"TripManagement">,
): readonly TripManagementSectionDefinition[] {
  return createTripManagementSections(t).filter(
    (section) => !section.ownerOnly || isOwner,
  );
}
