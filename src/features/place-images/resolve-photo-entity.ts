import "server-only";

import { connectDb } from "@/lib/db/connect";
import { isGoogleBackedActivity } from "@/features/itinerary/activity-place-domain";
import { getActivityForTrip } from "@/features/itinerary/queries";
import { Accommodation } from "@/models/Accommodation";

export async function resolveActivityGooglePlaceIdForPhoto(
  tripId: string,
  activityId: string,
): Promise<string | null> {
  const activity = await getActivityForTrip(tripId, activityId);
  if (!activity || !isGoogleBackedActivity(activity)) {
    return null;
  }

  return activity.googlePlaceId!.trim();
}

export async function resolveAccommodationGooglePlaceIdForPhoto(
  tripId: string,
  accommodationId: string,
): Promise<string | null> {
  await connectDb();
  const accommodation = await Accommodation.findOne({
    _id: accommodationId,
    tripId,
  })
    .select("placeSource googlePlaceId")
    .lean();

  if (
    !accommodation ||
    accommodation.placeSource !== "google" ||
    !accommodation.googlePlaceId?.trim()
  ) {
    return null;
  }

  return accommodation.googlePlaceId.trim();
}
