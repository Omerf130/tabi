import "server-only";

import mongoose from "mongoose";
import type { TripListType } from "./constants";
import { TRIP_LIST_MESSAGES } from "./constants";
import { DEFAULT_TRIP_LIST_ITEMS } from "./default-items";
import { getNextTripListItemOrder } from "./list-item-order";
import { connectDb } from "@/lib/db/connect";
import { withTransaction } from "@/lib/db/transaction";
import { Trip } from "@/models/Trip";
import { TripListItem } from "@/models/TripListItem";

export class TripListItemValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TripListItemValidationError";
  }
}

export class TripListItemNotFoundError extends Error {
  constructor() {
    super(TRIP_LIST_MESSAGES.notFound);
    this.name = "TripListItemNotFoundError";
  }
}

function buildDefaultInsertPayload(tripId: string) {
  return DEFAULT_TRIP_LIST_ITEMS.map((item) => ({
    tripId,
    listType: item.listType,
    text: item.text,
    order: item.order,
    isCompleted: false,
  }));
}

export async function ensureTripListsSeeded(tripId: string): Promise<void> {
  await connectDb();

  const trip = await Trip.findById(tripId).select("initializations.listsV1").lean();
  if (trip?.initializations?.listsV1 === true) {
    return;
  }

  await withTransaction(async (session) => {
    const claimed = await Trip.findOneAndUpdate(
      { _id: tripId, "initializations.listsV1": { $ne: true } },
      { $set: { "initializations.listsV1": true } },
      { session, new: false },
    ).lean();

    if (!claimed) {
      return;
    }

    await TripListItem.insertMany(buildDefaultInsertPayload(tripId), { session });
  });
}

export async function createTripListItem(input: {
  tripId: string;
  listType: TripListType;
  text: string;
  userId: string;
}): Promise<string> {
  await connectDb();
  await ensureTripListsSeeded(input.tripId);

  const existingItems = await TripListItem.find({
    tripId: input.tripId,
    listType: input.listType,
  })
    .select("order")
    .lean();

  const created = await TripListItem.create({
    tripId: input.tripId,
    listType: input.listType,
    text: input.text,
    order: getNextTripListItemOrder(existingItems),
    isCompleted: false,
    createdByUserId: input.userId,
  });

  return created._id.toString();
}

export async function updateTripListItemText(input: {
  tripId: string;
  itemId: string;
  text: string;
}): Promise<void> {
  await connectDb();
  const updated = await TripListItem.findOneAndUpdate(
    { _id: input.itemId, tripId: input.tripId },
    { text: input.text },
    { new: true },
  ).lean();

  if (!updated) {
    throw new TripListItemNotFoundError();
  }
}

export async function setTripListItemCompleted(input: {
  tripId: string;
  itemId: string;
  isCompleted: boolean;
  userId: string;
}): Promise<void> {
  await connectDb();

  const existing = await TripListItem.findOne({
    _id: input.itemId,
    tripId: input.tripId,
  }).lean();

  if (!existing) {
    throw new TripListItemNotFoundError();
  }

  if (existing.isCompleted === input.isCompleted) {
    return;
  }

  const update = input.isCompleted
    ? {
        isCompleted: true,
        completedByUserId: new mongoose.Types.ObjectId(input.userId),
        completedAt: new Date(),
      }
    : {
        isCompleted: false,
        completedByUserId: null,
        completedAt: null,
      };

  await TripListItem.findOneAndUpdate(
    { _id: input.itemId, tripId: input.tripId },
    update,
  );
}

export async function deleteTripListItem(input: {
  tripId: string;
  itemId: string;
}): Promise<void> {
  await connectDb();
  const deleted = await TripListItem.findOneAndDelete({
    _id: input.itemId,
    tripId: input.tripId,
  }).lean();

  if (!deleted) {
    throw new TripListItemNotFoundError();
  }
}
