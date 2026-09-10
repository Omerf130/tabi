import sectionStyles from "./TripSettingsSections.module.scss";

export type TripSettingsVariant = "stack" | "workspace";

export function getTripSettingsSectionClassName(
  variant: TripSettingsVariant = "stack",
): string {
  return variant === "workspace"
    ? sectionStyles.workspaceSection
    : sectionStyles.section;
}
