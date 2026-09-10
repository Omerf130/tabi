import type { ActivityFormValues } from "./types";

export function appendActivityFormValuesToFormData(
  formData: FormData,
  values: ActivityFormValues,
): void {
  formData.set("placeSource", values.placeSource);

  if (values.placeSource === "google") {
    formData.set("googlePlaceId", values.googlePlaceId);
    formData.set("locationName", values.locationName);
    formData.set("address", values.address);
    formData.set("city", values.city);
    formData.set("country", values.country);
    formData.set("latitude", values.latitude);
    formData.set("longitude", values.longitude);
    formData.set("googleMapsUrl", values.googleMapsUrl);
    return;
  }

  formData.set("locationName", values.locationName);
  formData.set("address", values.address);
}
