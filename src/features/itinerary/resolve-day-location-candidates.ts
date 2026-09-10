import {
  compareAccommodations,
  isAccommodationOccupiedOnDate,
} from "@/features/accommodations/accommodation-domain";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import { compareTransportDepartureTimesForSameDay } from "@/features/transport/transport-datetime";
import type { TransportItineraryItemViewModel, TransportRecord } from "@/features/transport/types";
import { isGoogleBackedActivity } from "./activity-place-domain";
import type { ActivityViewModel } from "./types";

export type DayLocationSourceType = "accommodation" | "activity" | "transport";

export type DayLocationCandidate = {
  sourceType: DayLocationSourceType;
  sourceId: string;
  query: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  country?: string;
};

const INVALID_CITY_VALUES = new Set(["—", "-", ""]);

function isUsableCity(city: string | undefined): city is string {
  const trimmed = city?.trim();
  return Boolean(trimmed && !INVALID_CITY_VALUES.has(trimmed));
}

function buildTransportSearchQuery(
  locationName: string,
  locationCode?: string | null,
): string {
  const name = locationName.trim();
  const code = locationCode?.trim();
  return code ? `${name} ${code}` : name;
}

function compareActivitiesForDay(a: ActivityViewModel, b: ActivityViewModel): number {
  if (a.order !== b.order) {
    return a.order - b.order;
  }
  return a.id.localeCompare(b.id);
}

function sortDayTransports(
  transports: readonly TransportItineraryItemViewModel[],
): TransportItineraryItemViewModel[] {
  return [...transports].sort((left, right) => {
    const byTime = compareTransportDepartureTimesForSameDay(
      left.departureTime,
      right.departureTime,
    );
    if (byTime !== 0) {
      return byTime;
    }
    return left.id.localeCompare(right.id);
  });
}

export type ResolveDayLocationCandidatesInput = {
  date: string;
  accommodations: readonly AccommodationViewModel[];
  activities: readonly ActivityViewModel[];
  dayTransports: readonly TransportItineraryItemViewModel[];
  transportRecords: ReadonlyMap<string, TransportRecord>;
};

export function resolveDayLocationCandidates({
  date,
  accommodations,
  activities,
  dayTransports,
  transportRecords,
}: ResolveDayLocationCandidatesInput): DayLocationCandidate[] {
  const candidates: DayLocationCandidate[] = [];

  const occupied = accommodations
    .filter((accommodation) =>
      isAccommodationOccupiedOnDate(
        accommodation.checkInDate,
        accommodation.checkOutDate,
        date,
      ),
    )
    .sort(compareAccommodations);

  const primaryAccommodation = occupied[0];
  if (primaryAccommodation && isUsableCity(primaryAccommodation.city)) {
    candidates.push({
      sourceType: "accommodation",
      sourceId: primaryAccommodation.id,
      query: `${primaryAccommodation.city.trim()}, Japan`,
    });
  }

  const dayActivities = activities
    .filter((activity) => activity.date === date)
    .sort(compareActivitiesForDay);

  const locatedActivity = dayActivities.find(
    (activity) => activity.locationName?.trim() || activity.address?.trim(),
  );

  if (locatedActivity) {
    if (
      isGoogleBackedActivity(locatedActivity) &&
      locatedActivity.latitude != null &&
      locatedActivity.longitude != null
    ) {
      candidates.push({
        sourceType: "activity",
        sourceId: locatedActivity.id,
        query:
          locatedActivity.locationName?.trim() ||
          locatedActivity.city?.trim() ||
          "Activity",
        coordinates: {
          latitude: locatedActivity.latitude,
          longitude: locatedActivity.longitude,
        },
        country: locatedActivity.country,
      });
    } else {
      const query =
        locatedActivity.locationName?.trim() ||
        locatedActivity.address?.trim() ||
        "";
      candidates.push({
        sourceType: "activity",
        sourceId: locatedActivity.id,
        query,
      });
    }
  }

  for (const transportItem of sortDayTransports(dayTransports)) {
    const transport = transportRecords.get(transportItem.id);
    if (!transport) {
      continue;
    }

    const endpoint =
      transport.arrival.date === date ? transport.arrival : transport.departure;

    candidates.push({
      sourceType: "transport",
      sourceId: transport.id,
      query: buildTransportSearchQuery(endpoint.locationName, endpoint.locationCode),
    });
  }

  return candidates;
}
