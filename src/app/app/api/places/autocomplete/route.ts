import { NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/session";
import { requireTripOwner } from "@/features/trips/authorization";
import {
  GooglePlacesConfigError,
  GooglePlacesRequestError,
  autocompletePlaces,
} from "@/features/places/googlePlaces.server";
import {
  PLACES_MESSAGES,
  PLACES_RATE_LIMIT_MAX_REQUESTS,
  PLACES_RATE_LIMIT_WINDOW_MS,
} from "@/features/places/constants";
import { placesAutocompleteRequestSchema } from "@/features/places/schemas";
import { checkPlacesRateLimit } from "@/features/places/rateLimit";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: PLACES_MESSAGES.unauthorized }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: PLACES_MESSAGES.invalidInput }, { status: 400 });
  }

  const parsed = placesAutocompleteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: PLACES_MESSAGES.invalidInput }, { status: 400 });
  }

  try {
    await requireTripOwner(parsed.data.tripId);
  } catch {
    return NextResponse.json({ error: PLACES_MESSAGES.forbidden }, { status: 403 });
  }

  if (
    !checkPlacesRateLimit(
      user.id,
      PLACES_RATE_LIMIT_WINDOW_MS,
      PLACES_RATE_LIMIT_MAX_REQUESTS,
    )
  ) {
    return NextResponse.json({ error: PLACES_MESSAGES.rateLimited }, { status: 429 });
  }

  try {
    const suggestions = await autocompletePlaces({
      query: parsed.data.input,
      sessionToken: parsed.data.sessionToken,
    });
    return NextResponse.json({ suggestions });
  } catch (error) {
    if (error instanceof GooglePlacesConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof GooglePlacesRequestError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json(
      { error: PLACES_MESSAGES.autocompleteFailed },
      { status: 500 },
    );
  }
}
