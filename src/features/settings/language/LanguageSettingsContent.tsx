import { requireUser } from "@/features/auth/session";
import { AppPage } from "@/features/app-shell/AppPage";
import { requireTripMember } from "@/features/trips/authorization";
import { LanguageSettingsClient } from "./LanguageSettings.client";

type LanguageSettingsContentProps = {
  tripId: string;
};

export async function LanguageSettingsContent({
  tripId,
}: LanguageSettingsContentProps) {
  const [, user] = await Promise.all([requireTripMember(tripId), requireUser()]);

  if (!user) {
    return null;
  }

  return (
    <AppPage width="wide" density="compact">
      <LanguageSettingsClient tripId={tripId} currentLocale={user.locale} />
    </AppPage>
  );
}
