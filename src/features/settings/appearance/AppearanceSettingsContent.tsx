import { AppPage } from "@/features/app-shell/AppPage";
import { requireTripMember } from "@/features/trips/authorization";
import {
  isTripThemeSelectable,
  listSelectableTripThemes,
  type TripThemeKey,
} from "@/features/trips/theme";
import { AppearanceSettingsClient } from "./AppearanceSettings.client";

type AppearanceSettingsContentProps = {
  tripId: string;
};

export async function AppearanceSettingsContent({
  tripId,
}: AppearanceSettingsContentProps) {
  const trip = await requireTripMember(tripId);
  const selectableThemes = listSelectableTripThemes().map((definition) => ({
    key: definition.key as TripThemeKey,
    nameMessageKey: definition.nameMessageKey,
    descriptionMessageKey: definition.descriptionMessageKey,
  }));

  return (
    <AppPage width="wide" density="compact">
      <AppearanceSettingsClient
        key={trip.themeKey}
        tripId={trip.id}
        isOwner={trip.role === "owner"}
        persistedThemeKey={trip.themeKey}
        persistedThemeSelectable={isTripThemeSelectable(trip.themeKey)}
        selectableThemes={selectableThemes}
      />
    </AppPage>
  );
}
