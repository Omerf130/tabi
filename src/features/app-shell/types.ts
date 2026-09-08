import type { TripMemberRole } from "@/models/TripMember";

export type TripShellContext = {
  tripId: string;
  tripName: string;
  role: TripMemberRole;
};

export type TripHeaderVariant = "home" | "section" | "members";
