import "server-only";

import type mongoose from "mongoose";
import { Trip } from "@/models/Trip";

export class TripNotFoundError extends Error {
  readonly code = "TRIP_NOT_FOUND" as const;

  constructor() {
    super("Trip not found");
    this.name = "TripNotFoundError";
  }
}

/**
 * Writes the Trip document inside a transaction to serialize owner-sensitive
 * membership mutations for the same trip. Concurrent transactions touching
 * the same Trip document will conflict rather than independently mutating
 * different TripMember documents (write-skew prevention).
 */
export async function serializeTripMutation(
  tripId: string,
  session: mongoose.ClientSession,
): Promise<void> {
  const trip = await Trip.findOneAndUpdate(
    { _id: tripId },
    { $currentDate: { updatedAt: true } },
    { session, new: false },
  );

  if (!trip) {
    throw new TripNotFoundError();
  }
}
