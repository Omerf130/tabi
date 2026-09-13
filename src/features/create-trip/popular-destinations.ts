import type { DestinationVisualGroup } from "@/features/destination-visuals/registry";

export type PopularDestinationPreset = {
  id: string;
  label: string;
  categoryLabel: string;
  visualGroup: DestinationVisualGroup;
  imageSrc: `/destination-visuals/${string}`;
};

/** Product-owned shortcuts — resolved live via destination autocomplete at click time. */
export const POPULAR_DESTINATIONS: PopularDestinationPreset[] = [
  {
    id: "japan",
    label: "Japan",
    categoryLabel: "Country",
    visualGroup: "japan",
    imageSrc: "/destination-visuals/japan.png",
  },
  {
    id: "thailand",
    label: "Thailand",
    categoryLabel: "Country",
    visualGroup: "fallback",
    imageSrc: "/destination-visuals/europe04.png",
  },
  {
    id: "italy",
    label: "Italy",
    categoryLabel: "Country",
    visualGroup: "europe",
    imageSrc: "/destination-visuals/europe02.png",
  },
  {
    id: "france",
    label: "France",
    categoryLabel: "Country",
    visualGroup: "europe",
    imageSrc: "/destination-visuals/europe01.png",
  },
  {
    id: "usa",
    label: "USA",
    categoryLabel: "Country",
    visualGroup: "fallback",
    imageSrc: "/destination-visuals/europe05.png",
  },
];
