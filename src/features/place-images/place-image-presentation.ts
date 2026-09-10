export type PlaceImagePresentationMode = "default" | "compact";

export function isCompactPlaceImagePresentation(
  presentation: PlaceImagePresentationMode,
): boolean {
  return presentation === "compact";
}
