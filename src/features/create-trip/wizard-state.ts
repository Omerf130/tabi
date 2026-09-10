import type { TripDestinationSnapshot } from "@/features/places/resolve-destination-snapshot";

export type CreateTripWizardStep =
  | "destination"
  | "dates"
  | "details"
  | "ready";

export const CREATE_TRIP_WIZARD_STEPS: CreateTripWizardStep[] = [
  "destination",
  "dates",
  "details",
  "ready",
];

export type CreateTripWizardState = {
  step: CreateTripWizardStep;
  destination: TripDestinationSnapshot | null;
  startDate: string;
  endDate: string;
  name: string;
  nameTouched: boolean;
};

export function createInitialWizardState(): CreateTripWizardState {
  return {
    step: "destination",
    destination: null,
    startDate: "",
    endDate: "",
    name: "",
    nameTouched: false,
  };
}

export function suggestTripName(
  destination: TripDestinationSnapshot,
  startDate: string,
): string {
  const year = startDate.slice(0, 4);
  if (/^\d{4}$/.test(year)) {
    return `${destination.displayName} ${year}`;
  }
  return destination.displayName;
}

export function getWizardStepIndex(step: CreateTripWizardStep): number {
  return CREATE_TRIP_WIZARD_STEPS.indexOf(step);
}
