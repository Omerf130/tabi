export const CREATE_TRIP_PROGRESS_STEP_COUNT = 5;
export const CREATE_TRIP_PROGRESS_MIN_TOTAL_MS = 6000;
export const CREATE_TRIP_PROGRESS_STEP_INTERVAL_MS = 1200;

export function getCreateTripProgressStepIndex(elapsedMs: number): number {
  if (elapsedMs <= 0) {
    return 0;
  }
  const index = Math.floor(elapsedMs / CREATE_TRIP_PROGRESS_STEP_INTERVAL_MS);
  return Math.min(index, CREATE_TRIP_PROGRESS_STEP_COUNT - 1);
}

export function canShowCreateTripReady(input: {
  elapsedMs: number;
  tripId: string | null | undefined;
}): boolean {
  return (
    typeof input.tripId === "string" &&
    input.tripId.length > 0 &&
    input.elapsedMs >= CREATE_TRIP_PROGRESS_MIN_TOTAL_MS
  );
}
