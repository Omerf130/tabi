import { getLocale } from "next-intl/server";
import { AppPage } from "@/features/app-shell/AppPage";
import { resolveAppLocale } from "@/features/i18n/locale";
import { requireTripMember } from "@/features/trips/authorization";
import { formatCalendarDateRangeDisplay } from "@/features/trips/calendar-date";
import { buildTravelersSettingsHref } from "@/features/settings/constants";
import { listTripMembers } from "@/features/trips/members/queries";
import { TripDetailsSettingsClient } from "./TripDetailsSettings.client";

type TripDetailsSettingsContentProps = {
  tripId: string;
};

function formatDestinationLabel(
  destination: { displayName: string; country?: string } | undefined,
): string {
  if (!destination?.displayName) {
    return "";
  }
  if (destination.country && destination.country !== destination.displayName) {
    return `${destination.displayName}, ${destination.country}`;
  }
  return destination.displayName;
}

export async function TripDetailsSettingsContent({
  tripId,
}: TripDetailsSettingsContentProps) {
  const [trip, localeRaw, members] = await Promise.all([
    requireTripMember(tripId),
    getLocale(),
    listTripMembers(tripId),
  ]);
  const locale = resolveAppLocale(localeRaw);

  const model = {
    tripId: trip.id,
    name: trip.name,
    description: trip.description ?? "",
    destinationLabel: formatDestinationLabel(trip.destination),
    dateRangeLabel: formatCalendarDateRangeDisplay(
      trip.startDate,
      trip.endDate,
      locale,
    ),
    startDate: trip.startDate,
    endDate: trip.endDate,
    hasCover: Boolean(trip.coverImage),
    coverVisualKey: trip.coverVisualKey ?? null,
    isOwner: trip.role === "owner",
    memberCount: members.length,
    travelersHref: buildTravelersSettingsHref(tripId),
  };

  return (
    <AppPage width="wide" density="compact">
      <TripDetailsSettingsClient model={model} />
    </AppPage>
  );
}
