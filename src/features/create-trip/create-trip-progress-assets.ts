/** Create Trip progress visuals — local paths only (not TripThemeAtmosphere). */

export const CREATE_TRIP_PROGRESS_STEP_ASSETS = [
  "/themes/ocean/top-wave.png",
  "/themes/forest/forest-top.png",
  "/themes/ocean/wave.png",
  "/themes/Sakura/sakura.png",
  "/themes/ocean/bottom-wave.png",
] as const;

export const CREATE_TRIP_READY_ASSET = "/themes/Sakura/sakura-bottom.png";

export const CREATE_TRIP_PROGRESS_ALL_ASSETS = [
  ...CREATE_TRIP_PROGRESS_STEP_ASSETS,
  CREATE_TRIP_READY_ASSET,
] as const;

export function getCreateTripProgressAssetForStep(stepIndex: number): string {
  const clamped = Math.max(
    0,
    Math.min(stepIndex, CREATE_TRIP_PROGRESS_STEP_ASSETS.length - 1),
  );
  return CREATE_TRIP_PROGRESS_STEP_ASSETS[clamped]!;
}
