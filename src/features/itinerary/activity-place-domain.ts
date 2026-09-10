import type { ResolvedPlacePreview } from "@/features/places/types";
import type { ActivityFormValues, ActivityViewModel } from "./types";
import type { ActivityPlaceSource } from "./activity-place-types";

export function resolveStoredActivityPlaceSource(
  placeSource: ActivityPlaceSource | null | undefined,
): ActivityPlaceSource {
  return placeSource === "google" ? "google" : "manual";
}

export function isGoogleBackedActivity(
  activity: Pick<ActivityViewModel, "placeSource" | "googlePlaceId">,
): boolean {
  return (
    resolveStoredActivityPlaceSource(activity.placeSource) === "google" &&
    Boolean(activity.googlePlaceId?.trim())
  );
}

export function toActivityPlaceSearchSelection(
  activity: Pick<
    ActivityViewModel,
    | "placeSource"
    | "googlePlaceId"
    | "locationName"
    | "address"
    | "city"
    | "country"
    | "latitude"
    | "longitude"
    | "googleMapsUrl"
  >,
): ResolvedPlacePreview | null {
  if (!isGoogleBackedActivity(activity) || !activity.locationName) {
    return null;
  }

  return {
    placeId: activity.googlePlaceId!,
    primaryText: activity.locationName,
    secondaryText: activity.city,
    formattedAddress: activity.address,
    city: activity.city,
    country: activity.country,
    latitude: activity.latitude,
    longitude: activity.longitude,
    googleMapsUrl: activity.googleMapsUrl,
  };
}

export function toActivityPlaceSearchSelectionFromFormValues(
  values: Pick<
    ActivityFormValues,
    | "placeSource"
    | "googlePlaceId"
    | "locationName"
    | "address"
    | "city"
    | "country"
    | "latitude"
    | "longitude"
    | "googleMapsUrl"
  >,
): ResolvedPlacePreview | null {
  return toActivityPlaceSearchSelection({
    placeSource: values.placeSource,
    googlePlaceId: values.googlePlaceId,
    locationName: values.locationName,
    address: values.address,
    city: values.city || undefined,
    country: values.country || undefined,
    latitude: values.latitude ? Number(values.latitude) : undefined,
    longitude: values.longitude ? Number(values.longitude) : undefined,
    googleMapsUrl: values.googleMapsUrl || undefined,
  });
}

export function toActivityFormValuesFromGoogleSelection(
  selection: ResolvedPlacePreview,
): Pick<
  ActivityFormValues,
  | "placeSource"
  | "googlePlaceId"
  | "locationName"
  | "address"
  | "city"
  | "country"
  | "latitude"
  | "longitude"
  | "googleMapsUrl"
> {
  return {
    placeSource: "google",
    googlePlaceId: selection.placeId,
    locationName: selection.primaryText,
    address: selection.formattedAddress ?? "",
    city: selection.city ?? "",
    country: selection.country ?? "",
    latitude: selection.latitude != null ? String(selection.latitude) : "",
    longitude: selection.longitude != null ? String(selection.longitude) : "",
    googleMapsUrl: selection.googleMapsUrl ?? "",
  };
}

export function clearGoogleActivityFields(): Pick<
  ActivityFormValues,
  | "placeSource"
  | "googlePlaceId"
  | "locationName"
  | "address"
  | "city"
  | "country"
  | "latitude"
  | "longitude"
  | "googleMapsUrl"
> {
  return {
    placeSource: "manual",
    googlePlaceId: "",
    locationName: "",
    address: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
    googleMapsUrl: "",
  };
}
