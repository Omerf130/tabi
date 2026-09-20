import { getTranslations } from "next-intl/server";
import { AppPage } from "@/features/app-shell/AppPage";
import { resolveRequestLocale } from "@/features/i18n/resolve-request-locale";
import { requireTripMember } from "@/features/trips/authorization";
import { buildTravelLanguageSettingsViewModel } from "@/features/language/travel-language/build-travel-language-settings-view-model";
import { TravelLanguageSettingsClient } from "./TravelLanguageSettings.client";

type LanguageSettingsContentProps = {
  tripId: string;
};

export async function LanguageSettingsContent({
  tripId,
}: LanguageSettingsContentProps) {
  const trip = await requireTripMember(tripId);
  const locale = await resolveRequestLocale();
  const t = await getTranslations("Settings");

  const model = buildTravelLanguageSettingsViewModel({
    trip,
    isOwner: trip.role === "owner",
    locale,
    t,
  });

  return (
    <AppPage width="wide" density="compact">
      <TravelLanguageSettingsClient {...model} />
    </AppPage>
  );
}
