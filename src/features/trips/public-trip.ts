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

export type TripWorkspace = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  role: TripMemberRole;
};

type TripRecord = {
  _id: { toString(): string };
  name: string;
  startDate: string;
  endDate: string;
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
  };
}
