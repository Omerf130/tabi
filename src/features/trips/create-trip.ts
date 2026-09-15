import "server-only";

import mongoose from "mongoose";
import { resolveDestinationSnapshot } from "@/features/places/resolve-destination-snapshot";
import { resolveCoverVisualKeyForDestination } from "./resolve-cover-visual-key";
import { connectDb } from "@/lib/db/connect";
import { Trip } from "@/models/Trip";
import { TripMember } from "@/models/TripMember";
import { DEFAULT_TRIP_THEME_KEY } from "./theme";
import type { CreateTripWizardInput } from "./schemas";

export async function createTripWithOwnerMembership(
  userId: string,
  input: CreateTripWizardInput,
): Promise<string> {
  await connectDb();

  const destination = await resolveDestinationSnapshot(input.googlePlaceId);
  const coverVisualKey = resolveCoverVisualKeyForDestination(destination);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [trip] = await Trip.create(
      [
        {
          name: input.name,
          description: input.description,
          startDate: input.startDate,
          endDate: input.endDate,
          createdBy: userId,
          destination,
          coverVisualKey,
          themeKey: DEFAULT_TRIP_THEME_KEY,
        },
      ],
      { session },
    );

    await TripMember.create(
      [
        {
          tripId: trip._id,
          userId,
          role: "owner",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return trip._id.toString();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
