export type DestinationVisualGroup = "japan" | "europe" | "fallback";

export type DestinationVisualKey =
  | "japan-01"
  | "japan-02"
  | "europe-01"
  | "europe-02"
  | "europe-03"
  | "europe-04"
  | "europe-05"
  | "europe-06"
  | "fallback-01";

type DestinationVisualEntry = {
  group: DestinationVisualGroup;
  src: `/destination-visuals/${string}`;
};

export const DESTINATION_VISUAL_REGISTRY: Record<
  DestinationVisualKey,
  DestinationVisualEntry
> = {
  "japan-01": { group: "japan", src: "/destination-visuals/japan.png" },
  "japan-02": { group: "japan", src: "/destination-visuals/japan02.png" },
  "europe-01": { group: "europe", src: "/destination-visuals/europe01.png" },
  "europe-02": { group: "europe", src: "/destination-visuals/europe02.png" },
  "europe-03": { group: "europe", src: "/destination-visuals/europe03.png" },
  "europe-04": { group: "europe", src: "/destination-visuals/europe04.png" },
  "europe-05": { group: "europe", src: "/destination-visuals/europe05.png" },
  "europe-06": { group: "europe", src: "/destination-visuals/europe06.png" },
  "fallback-01": { group: "fallback", src: "/destination-visuals/homeApp.png" },
};

export const VISUAL_KEYS_BY_GROUP: Record<
  DestinationVisualGroup,
  readonly DestinationVisualKey[]
> = {
  japan: ["japan-01", "japan-02"],
  europe: [
    "europe-01",
    "europe-02",
    "europe-03",
    "europe-04",
    "europe-05",
    "europe-06",
  ],
  fallback: ["fallback-01"],
};

export const NEUTRAL_FALLBACK_VISUAL_SRC = DESTINATION_VISUAL_REGISTRY["fallback-01"].src;

const VALID_KEYS = new Set<string>(Object.keys(DESTINATION_VISUAL_REGISTRY));

export function isValidVisualKey(key: string): key is DestinationVisualKey {
  return VALID_KEYS.has(key);
}

export function resolveVisualSrc(key: DestinationVisualKey): string {
  return DESTINATION_VISUAL_REGISTRY[key].src;
}

export function getRepresentativeVisualSrcForGroup(
  group: DestinationVisualGroup,
): string {
  const key = VISUAL_KEYS_BY_GROUP[group][0];
  return resolveVisualSrc(key);
}

export function getVisualGroupForKey(key: DestinationVisualKey): DestinationVisualGroup {
  return DESTINATION_VISUAL_REGISTRY[key].group;
}
