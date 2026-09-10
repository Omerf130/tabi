import { randomInt } from "node:crypto";
import type { DestinationVisualGroup, DestinationVisualKey } from "./registry";
import { VISUAL_KEYS_BY_GROUP } from "./registry";

export function pickVisualKeyForGroup(
  group: DestinationVisualGroup,
): DestinationVisualKey {
  const keys = VISUAL_KEYS_BY_GROUP[group];
  const index = randomInt(keys.length);
  return keys[index]!;
}
