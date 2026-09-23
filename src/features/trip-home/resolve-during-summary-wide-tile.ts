export type DuringSummaryTileKind =
  | "tonight"
  | "weather"
  | "activities"
  | "trip-day"
  | "transport";

/** When exactly three tiles exist, one rich tile spans full width for balance. */
export function resolveDuringSummaryWideTileId(
  tileIds: readonly DuringSummaryTileKind[],
): DuringSummaryTileKind | null {
  if (tileIds.length !== 3) {
    return null;
  }

  if (tileIds.includes("tonight")) {
    return "tonight";
  }

  if (tileIds.includes("weather")) {
    return "weather";
  }

  return tileIds[0] ?? null;
}
