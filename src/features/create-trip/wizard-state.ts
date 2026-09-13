import type { TripDestinationSnapshot } from "@/features/places/resolve-destination-snapshot";
import { compareCalendarDates } from "@/features/trips/calendar-date";
import { TRIP_MAX_DURATION_DAYS } from "@/features/trips/constants";
import { getTripDayCount } from "@/features/trips/trip-days";

export type CreateTripWizardStep = "destination" | "dates" | "details";

export const CREATE_TRIP_WIZARD_STEPS: CreateTripWizardStep[] = [
  "destination",
  "dates",
  "details",
];

export const WIZARD_STEP_LABELS: Record<CreateTripWizardStep, string> = {
  destination: "Destination",
  dates: "Dates",
  details: "Trip Details",
};

export type CreateTripWizardState = {
  step: CreateTripWizardStep;
  destination: TripDestinationSnapshot | null;
  startDate: string;
  endDate: string;
  name: string;
  description: string;
  nameTouched: boolean;
};

export function createInitialWizardState(): CreateTripWizardState {
  return {
    step: "destination",
    destination: null,
    startDate: "",
    endDate: "",
    name: "",
    description: "",
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

export function isValidWizardDateRange(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) {
    return false;
  }
  if (compareCalendarDates(startDate, endDate) > 0) {
    return false;
  }
  try {
    return getTripDayCount(startDate, endDate) <= TRIP_MAX_DURATION_DAYS;
  } catch {
    return false;
  }
}
