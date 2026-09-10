import type { TripMemberRole } from "@/models/TripMember";
import type { TripPhase } from "@/features/trips/trip-phase";

export type MyTripsCardItem = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  role: TripMemberRole;
  phase: TripPhase;
  imageSrc: string;
  hasPersistedCover: boolean;
};
