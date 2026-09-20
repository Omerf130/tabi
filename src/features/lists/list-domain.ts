import "server-only";

import mongoose from "mongoose";
import type { TripListType } from "./constants";
import { TRIP_LIST_ERROR_CODES } from "./constants";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { resolveRequestLocale } from "@/features/i18n/resolve-request-locale";
import { buildListSeedItems } from "./build-list-seed-items";
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
  readonly code = TRIP_LIST_ERROR_CODES.notFound;

  constructor() {
    super(TRIP_LIST_ERROR_CODES.notFound);
    this.name = "TripListItemNotFoundError";
  }
}

async function buildDefaultInsertPayload(tripId: string, countryCode?: string | null) {
  const locale = await resolveRequestLocale();
  const t = createAppTranslator("Lists", locale);
  const items = buildListSeedItems(countryCode, t);
  return items.map((item) => ({
    tripId,
    listType: item.listType,
    text: item.text,
    order: item.order,
    isCompleted: false,
  }));
}

export async function ensureTripListsSeeded(tripId: string): Promise<void> {
  await connectDb();

  const trip = await Trip.findById(tripId)
    .select("initializations.listsV1 destination.countryCode")
    .lean();
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

    const payload = await buildDefaultInsertPayload(
      tripId,
      claimed.destination?.countryCode,
    );
    await TripListItem.insertMany(payload, { session });
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
