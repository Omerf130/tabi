import type { DestinationVisualGroup } from "@/features/destination-visuals/registry";

export type PopularDestinationPreset = {
  id: string;
  /** Search query passed to destination autocomplete — not UI copy. */
  label: string;
  categoryKey: "country";
  visualGroup: DestinationVisualGroup;
  imageSrc: `/destination-visuals/${string}`;
};

/** Product-owned shortcuts — resolved live via destination autocomplete at click time. */
export const POPULAR_DESTINATIONS: PopularDestinationPreset[] = [
  {
    id: "japan",
    label: "Japan",
    categoryKey: "country",
    visualGroup: "japan",
    imageSrc: "/destination-visuals/japan.png",
  },
  {
    id: "thailand",
    label: "Thailand",
    categoryKey: "country",
    visualGroup: "fallback",
    imageSrc: "/destination-visuals/europe04.png",
  },
  {
    id: "italy",
    label: "Italy",
    categoryKey: "country",
    visualGroup: "europe",
    imageSrc: "/destination-visuals/europe02.png",
  },
  {
    id: "france",
    label: "France",
    categoryKey: "country",
    visualGroup: "europe",
    imageSrc: "/destination-visuals/europe01.png",
  },
  {
    id: "usa",
    label: "USA",
    categoryKey: "country",
    visualGroup: "fallback",
    imageSrc: "/destination-visuals/europe05.png",
  },
];
