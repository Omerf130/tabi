import type { DestinationVisualGroup } from "@/features/destination-visuals/registry";

export type PopularDestinationPreset = {
  id: string;
  label: string;
  visualGroup: DestinationVisualGroup;
  imageSrc: `/destination-visuals/${string}`;
};

/** Product-owned shortcuts — resolved live via destination autocomplete at click time. */
export const POPULAR_DESTINATIONS: PopularDestinationPreset[] = [
  {
    id: "japan",
    label: "Japan",
    visualGroup: "japan",
    imageSrc: "/destination-visuals/japan.png",
  },
  {
    id: "france",
    label: "France",
    visualGroup: "europe",
    imageSrc: "/destination-visuals/europe01.png",
  },
  {
    id: "italy",
    label: "Italy",
    visualGroup: "europe",
    imageSrc: "/destination-visuals/europe02.png",
  },
  {
    id: "spain",
    label: "Spain",
    visualGroup: "europe",
    imageSrc: "/destination-visuals/europe03.png",
  },
];
