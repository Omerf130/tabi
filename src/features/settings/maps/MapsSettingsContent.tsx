import { requireUser } from "@/features/auth/session";
import { AppPage } from "@/features/app-shell/AppPage";
import { requireTripMember } from "@/features/trips/authorization";
import { MapsSettingsClient } from "./MapsSettings.client";

type MapsSettingsContentProps = {
  tripId: string;
};

export async function MapsSettingsContent({ tripId }: MapsSettingsContentProps) {
  const [, user] = await Promise.all([requireTripMember(tripId), requireUser()]);

  if (!user) {
    return null;
  }

  return (
    <AppPage width="wide" density="compact">
      <MapsSettingsClient
        tripId={tripId}
        storedPreferredMapsApp={user.preferredMapsApp}
      />
    </AppPage>
  );
}
