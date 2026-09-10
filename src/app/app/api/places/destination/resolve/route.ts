import { NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/session";
import { destinationResolveRequestSchema } from "@/features/places/destination-schemas";
import {
  GooglePlacesConfigError,
  GooglePlacesRequestError,
} from "@/features/places/googlePlaces.server";
import {
  PLACES_MESSAGES,
  PLACES_RATE_LIMIT_MAX_REQUESTS,
  PLACES_RATE_LIMIT_WINDOW_MS,
} from "@/features/places/constants";
import { checkPlacesRateLimit } from "@/features/places/rateLimit";
import { resolveDestinationSnapshot } from "@/features/places/resolve-destination-snapshot";

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

  const parsed = destinationResolveRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: PLACES_MESSAGES.invalidInput }, { status: 400 });
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
    const snapshot = await resolveDestinationSnapshot(parsed.data.placeId, {
      sessionToken: parsed.data.sessionToken,
      primaryText: parsed.data.primaryText,
      secondaryText: parsed.data.secondaryText,
    });
    return NextResponse.json({ snapshot });
  } catch (error) {
    if (error instanceof GooglePlacesConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof GooglePlacesRequestError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json({ error: PLACES_MESSAGES.resolveFailed }, { status: 500 });
  }
}
