import { requireUser } from "@/features/auth/session";
import { servePlacePhotoResponse } from "@/features/place-images/serve-place-photo";
import { resolveAccommodationGooglePlaceIdForPhoto } from "@/features/place-images/resolve-photo-entity";
import { requireTripMember } from "@/features/trips/authorization";

export async function GET(
  _request: Request,
  context: { params: Promise<{ tripId: string; accommodationId: string }> },
): Promise<Response> {
  const { tripId, accommodationId } = await context.params;
  await requireTripMember(tripId);
  const user = await requireUser();

  const googlePlaceId = await resolveAccommodationGooglePlaceIdForPhoto(
    tripId,
    accommodationId,
  );
  if (!googlePlaceId) {
    return new Response(null, { status: 404 });
  }

  return servePlacePhotoResponse({
    googlePlaceId,
    userId: user.id,
  });
}
