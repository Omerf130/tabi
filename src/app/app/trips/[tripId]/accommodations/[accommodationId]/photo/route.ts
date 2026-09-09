import { getAccommodationForTrip } from "@/features/accommodations/queries";
import {
  fetchPlacePhotoMedia,
  getPlacePrimaryPhotoName,
} from "@/features/places/googlePlaces.server";
import { requireTripMember } from "@/features/trips/authorization";

export async function GET(
  _request: Request,
  context: { params: Promise<{ tripId: string; accommodationId: string }> },
): Promise<Response> {
  const { tripId, accommodationId } = await context.params;
  await requireTripMember(tripId);

  const accommodation = await getAccommodationForTrip(tripId, accommodationId);
  if (!accommodation?.googlePlaceId) {
    return new Response(null, { status: 404 });
  }

  const photoName = await getPlacePrimaryPhotoName(accommodation.googlePlaceId);
  if (!photoName) {
    return new Response(null, { status: 404 });
  }

  const mediaResponse = await fetchPlacePhotoMedia(photoName);
  if (!mediaResponse.ok) {
    return new Response(null, { status: 404 });
  }

  const bytes = await mediaResponse.arrayBuffer();

  return new Response(bytes, {
    headers: {
      "Content-Type": mediaResponse.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
