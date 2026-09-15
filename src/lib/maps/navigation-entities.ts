import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { ActivityViewModel } from "@/features/itinerary/types";
import { buildNavigationUrl } from "./navigation-url";
import {
  resolvePreferredMapsApp,
  type PreferredMapsApp,
} from "./maps-app";

function activityNavigationInput(activity: ActivityViewModel) {
  return {
    latitude: activity.latitude,
    longitude: activity.longitude,
    address: activity.address,
    label: activity.locationName ?? activity.title,
    googleMapsUrl: activity.googleMapsUrl,
  };
}

export function buildActivityNavigationHref(
  activity: ActivityViewModel,
  preferredMapsApp: PreferredMapsApp,
): string | null {
  return buildNavigationUrl({
    provider: resolvePreferredMapsApp(preferredMapsApp),
    ...activityNavigationInput(activity),
  });
}

export function withActivityNavigationHrefs(
  activities: readonly ActivityViewModel[],
  preferredMapsApp: PreferredMapsApp,
): ActivityViewModel[] {
  return activities.map((activity) => {
    const navigationHref =
      buildActivityNavigationHref(activity, preferredMapsApp) ?? undefined;
    return navigationHref ? { ...activity, navigationHref } : activity;
  });
}

export function buildAccommodationNavigationHref(
  accommodation: Pick<
    AccommodationViewModel,
    "name" | "addressEnglish" | "addressJapanese" | "googleMapsUrl"
  >,
  preferredMapsApp: PreferredMapsApp,
): string | null {
  const address =
    accommodation.addressEnglish?.trim() ||
    accommodation.addressJapanese?.trim() ||
    undefined;

  return buildNavigationUrl({
    provider: resolvePreferredMapsApp(preferredMapsApp),
    label: accommodation.name,
    address,
    googleMapsUrl: accommodation.googleMapsUrl,
  });
}
