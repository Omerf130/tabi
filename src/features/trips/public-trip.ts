import type { TripMemberRole } from "@/models/TripMember";
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
};

export type TripWorkspace = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  role: TripMemberRole;
  coverImage?: TripCoverImage;
  coverVisualKey?: string | null;
  destination?: TripWorkspaceDestination;
};

export type TripCoverImage = {
  pathname: string;
  contentType: string;
};

type TripRecord = {
  _id: { toString(): string };
  name: string;
  startDate: string;
  endDate: string;
  coverImage?: {
    pathname: string;
    contentType: string;
  } | null;
  coverVisualKey?: string | null;
  destination?: {
    displayName: string;
    country?: string | null;
  } | null;
};

export function toTripListItem(
  trip: TripRecord,
  role: TripMemberRole,
  todayJapan?: string,
): TripListItem {
  return {
    id: trip._id.toString(),
    name: trip.name,
    startDate: trip.startDate,
    endDate: trip.endDate,
    role,
    phase: getTripPhase(trip.startDate, trip.endDate, todayJapan),
  };
}

export function toTripWorkspace(
  trip: TripRecord,
  role: TripMemberRole,
): TripWorkspace {
  return {
    id: trip._id.toString(),
    name: trip.name,
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
    destination: trip.destination
      ? {
          displayName: trip.destination.displayName,
          country: trip.destination.country ?? undefined,
        }
      : undefined,
  };
}
