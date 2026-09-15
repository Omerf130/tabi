import { requireUser } from "@/features/auth/session";
import { AppPage } from "@/features/app-shell/AppPage";
import { listActiveTripInvitations } from "@/features/trips/invitations/queries";
import { requireTripMember } from "@/features/trips/authorization";
import { listTripMembers } from "@/features/trips/members/queries";
import { buildTravelersSettingsViewModel } from "./build-travelers-settings-view-model";
import { TravelersSettingsClient } from "./TravelersSettings.client";

type TravelersSettingsContentProps = {
  tripId: string;
};

export async function TravelersSettingsContent({
  tripId,
}: TravelersSettingsContentProps) {
  const [trip, user, members] = await Promise.all([
    requireTripMember(tripId),
    requireUser(),
    listTripMembers(tripId),
  ]);

  const isOwner = trip.role === "owner";
  const activeInvitations = isOwner
    ? await listActiveTripInvitations(tripId)
    : undefined;

  const model = buildTravelersSettingsViewModel({
    tripId: trip.id,
    isOwner,
    currentUserId: user.id,
    members,
    activeInvitations,
  });

  return (
    <AppPage width="wide" density="compact">
      <TravelersSettingsClient model={model} />
    </AppPage>
  );
}
