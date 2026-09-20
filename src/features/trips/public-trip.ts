import type { TripMemberRole } from "@/models/TripMember";
import { resolveTripThemeKey, type TripThemeKey } from "./theme";
import { getTripPhase, type TripPhase } from "./trip-phase";

export type TripListItem = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  role: TripMemberRole;
  phase: TripPhase;
};

export type TripWorkspaceDestination = {
  displayName: string;
  country?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  timeZone?: string;
};

export type TripWorkspace = {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  role: TripMemberRole;
  coverImage?: TripCoverImage;
  coverVisualKey?: string | null;
  themeKey: TripThemeKey;
  /** Resolved IANA timezone for trip-scoped calendar behavior (server-derived). */
  destinationCalendarTimeZone: string;
  destination?: TripWorkspaceDestination;
};

export type TripCoverImage = {
  pathname: string;
  contentType: string;
};

type TripRecord = {
  _id: { toString(): string };
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  coverImage?: {
    pathname: string;
    contentType: string;
  } | null;
  coverVisualKey?: string | null;
  themeKey?: string | null;
  destination?: {
    displayName: string;
    country?: string | null;
    countryCode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    timeZone?: string | null;
  } | null;
};

export function toTripListItem(
  trip: TripRecord,
  role: TripMemberRole,
  todayTripLocal: string,
): TripListItem {
  return {
    id: trip._id.toString(),
    name: trip.name,
    startDate: trip.startDate,
    endDate: trip.endDate,
    role,
    phase: getTripPhase(trip.startDate, trip.endDate, todayTripLocal),
  };
}

export function toTripWorkspace(
  trip: TripRecord,
  role: TripMemberRole,
  destinationCalendarTimeZone: string,
): TripWorkspace {
  return {
    id: trip._id.toString(),
    name: trip.name,
    description: trip.description?.trim() ? trip.description.trim() : "",
    startDate: trip.startDate,
    endDate: trip.endDate,
    role,
    coverImage: trip.coverImage
      ? {
          pathname: trip.coverImage.pathname,
          contentType: trip.coverImage.contentType,
        }
      : undefined,
    coverVisualKey: trip.coverVisualKey ?? null,
    themeKey: resolveTripThemeKey(trip.themeKey),
    destinationCalendarTimeZone,
    destination: trip.destination
      ? {
          displayName: trip.destination.displayName,
          country: trip.destination.country ?? undefined,
          countryCode: trip.destination.countryCode ?? undefined,
          latitude:
            typeof trip.destination.latitude === "number"
              ? trip.destination.latitude
              : undefined,
          longitude:
            typeof trip.destination.longitude === "number"
              ? trip.destination.longitude
              : undefined,
          timeZone: trip.destination.timeZone?.trim() || undefined,
        }
      : undefined,
  };
}
