import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { TripPhase } from "./trip-phase";
import type { TripMemberRole } from "@/models/TripMember";

export function createTripPhaseLabelResolver(t: AppTranslator<"Trips">) {
  return (phase: TripPhase) => t(`phases.${phase}`);
}

export function createTripRoleLabelResolver(t: AppTranslator<"Trips">) {
  return (role: TripMemberRole) => t(`roles.${role}`);
}
