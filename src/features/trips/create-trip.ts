import "server-only";

import mongoose from "mongoose";
import { classifyDestinationVisualGroup } from "@/features/destination-visuals/classify-visual-group";
import {
  getVisualGroupForKey,
  isValidVisualKey,
} from "@/features/destination-visuals/registry";
import { pickVisualKeyForGroup } from "@/features/destination-visuals/pick-visual-key";
import { resolveDestinationSnapshot } from "@/features/places/resolve-destination-snapshot";
import { connectDb } from "@/lib/db/connect";
import { Trip } from "@/models/Trip";
import { TripMember } from "@/models/TripMember";
import type { CreateTripWizardInput } from "./schemas";

export async function createTripWithOwnerMembership(
  userId: string,
  input: CreateTripWizardInput,
): Promise<string> {
  await connectDb();

  const destination = await resolveDestinationSnapshot(input.googlePlaceId);
  const visualGroup = classifyDestinationVisualGroup(destination.countryCode);
  const coverVisualKey = pickVisualKeyForGroup(visualGroup);

  if (
    !isValidVisualKey(coverVisualKey) ||
    getVisualGroupForKey(coverVisualKey) !== visualGroup
  ) {
    throw new Error("Invalid cover visual selection");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [trip] = await Trip.create(
      [
        {
          name: input.name,
          startDate: input.startDate,
          endDate: input.endDate,
          createdBy: userId,
          destination,
          coverVisualKey,
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
