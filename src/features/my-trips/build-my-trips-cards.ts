import type { TripMemberRole } from "@/models/TripMember";
import { toTripListItem } from "@/features/trips/public-trip";
import { sortTripListItems } from "@/features/trips/trip-sort";
import { resolveTripCardVisual } from "./resolve-trip-card-visual";
import type { MyTripsCardItem } from "./types";

type TripRecord = {
  _id: { toString(): string };
  name: string;
  startDate: string;
  endDate: string;
  coverImage?: { pathname: string; contentType: string } | null;
  coverVisualKey?: string | null;
};

function toMyTripsCardItem(
  trip: TripRecord,
  role: TripMemberRole,
  todayJapan: string,
): MyTripsCardItem {
  const tripId = trip._id.toString();
  const listItem = toTripListItem(trip, role, todayJapan);
  const hasCoverImage = Boolean(trip.coverImage?.pathname);
  const visual = resolveTripCardVisual(
    tripId,
    hasCoverImage,
    trip.coverVisualKey,
  );

  return {
    ...listItem,
    imageSrc: visual.imageSrc,
    hasPersistedCover: visual.hasPersistedCover,
  };
}

export function buildMyTripsCards(
  trips: TripRecord[],
  roleByTripId: Map<string, TripMemberRole>,
  todayJapan: string,
): MyTripsCardItem[] {
  const items = trips
    .map((trip) => {
      const role = roleByTripId.get(trip._id.toString());
      if (!role) {
        return null;
      }
      return toMyTripsCardItem(trip, role, todayJapan);
    })
    .filter((item): item is MyTripsCardItem => item !== null);

  const itemById = new Map(items.map((item) => [item.id, item]));
  const sortedListItems = sortTripListItems(items);

  return sortedListItems.map((item) => itemById.get(item.id)!);
}
