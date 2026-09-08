import "server-only";

import mongoose from "mongoose";
import { connectDb } from "@/lib/db/connect";
import { Trip } from "@/models/Trip";
import { TripMember } from "@/models/TripMember";
import type { CreateTripInput } from "./schemas";

export async function createTripWithOwnerMembership(
  userId: string,
  input: CreateTripInput,
): Promise<string> {
  await connectDb();

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
