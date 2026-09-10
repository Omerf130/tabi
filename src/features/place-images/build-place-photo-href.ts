export function buildActivityPhotoHref(
  tripId: string,
  activityId: string,
): string {
  return `/app/trips/${tripId}/activities/${activityId}/photo`;
}

export function buildAccommodationPhotoHref(
  tripId: string,
  accommodationId: string,
): string {
  return `/app/trips/${tripId}/accommodations/${accommodationId}/photo`;
}
