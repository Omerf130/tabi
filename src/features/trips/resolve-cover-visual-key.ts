import "server-only";

import { classifyDestinationVisualGroup } from "@/features/destination-visuals/classify-visual-group";
import {
  getVisualGroupForKey,
  isValidVisualKey,
} from "@/features/destination-visuals/registry";
import { pickVisualKeyForGroup } from "@/features/destination-visuals/pick-visual-key";
import type { TripDestinationSnapshot } from "@/features/places/resolve-destination-snapshot";

export function resolveCoverVisualKeyForDestination(
  destination: TripDestinationSnapshot,
): string {
  const visualGroup = classifyDestinationVisualGroup(destination.countryCode);
  const coverVisualKey = pickVisualKeyForGroup(visualGroup);

  if (
    !isValidVisualKey(coverVisualKey) ||
    getVisualGroupForKey(coverVisualKey) !== visualGroup
  ) {
    throw new Error("Invalid cover visual selection");
  }

  return coverVisualKey;
}
