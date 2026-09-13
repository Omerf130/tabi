import "server-only";

import mongoose from "mongoose";
import { getTranslations } from "next-intl/server";
import {
  TRIP_LIST_DEFINITIONS,
  type TripListType,
} from "./constants";
import { ensureTripListsSeeded } from "./list-domain";
import { formatListProgressLabel } from "./list-progress-label";
import { sortTripListItemsForDisplay } from "./list-item-order";
import type {
  TripListDetailViewModel,
  TripListItemViewModel,
  TripListProgress,
  TripListSummaryViewModel,
} from "./types";
import { connectDb } from "@/lib/db/connect";
import { TripListItem } from "@/models/TripListItem";

function toItemViewModel(item: {
  _id: mongoose.Types.ObjectId;
  listType: TripListType;
  text: string;
  isCompleted: boolean;
  order: number;
  createdAt: Date;
}): TripListItemViewModel {
  return {
    id: item._id.toString(),
    listType: item.listType,
    text: item.text,
    isCompleted: item.isCompleted,
    order: item.order,
    createdAt: item.createdAt.toISOString(),
  };
}

async function aggregateProgressByListType(
  tripId: string,
): Promise<Map<TripListType, TripListProgress>> {
  const results = await TripListItem.aggregate<{
    _id: TripListType;
    totalCount: number;
    completedCount: number;
  }>([
    { $match: { tripId: new mongoose.Types.ObjectId(tripId) } },
    {
      $group: {
        _id: "$listType",
        totalCount: { $sum: 1 },
        completedCount: {
          $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] },
        },
      },
    },
  ]);

  const progressMap = new Map<TripListType, TripListProgress>();
  for (const result of results) {
    progressMap.set(result._id, {
      totalCount: result.totalCount,
      completedCount: result.completedCount,
    });
  }

  return progressMap;
}

export async function listTripListsSummary(
  tripId: string,
): Promise<TripListSummaryViewModel[]> {
  await connectDb();
  await ensureTripListsSeeded(tripId);

  const t = await getTranslations("Lists");
  const tDefinitions = await getTranslations("Lists.definitions");
  const progressMap = await aggregateProgressByListType(tripId);

  return TRIP_LIST_DEFINITIONS.map((definition) => {
    const progress = progressMap.get(definition.type) ?? {
      totalCount: 0,
      completedCount: 0,
    };

    return {
      type: definition.type,
      slug: definition.slug,
      title: tDefinitions(definition.type),
      icon: definition.icon,
      progress,
      progressLabel: formatListProgressLabel(progress, (values) =>
        t("progressLabel", values),
      ),
    };
  });
}

export async function listTripListItemsForTypes(
  tripId: string,
  listTypes: readonly TripListType[],
): Promise<TripListItemViewModel[]> {
  await connectDb();
  await ensureTripListsSeeded(tripId);

  if (listTypes.length === 0) {
    return [];
  }

  const items = await TripListItem.find({
    tripId,
    listType: { $in: listTypes },
  }).lean();

  return sortTripListItemsForDisplay(
    items.map((item) => toItemViewModel(item)),
  );
}

export async function getTripListDetail(
  tripId: string,
  listType: TripListType,
): Promise<TripListDetailViewModel> {
  await connectDb();
  await ensureTripListsSeeded(tripId);

  const definition = TRIP_LIST_DEFINITIONS.find(
    (entry) => entry.type === listType,
  );
  if (!definition) {
    throw new Error("Unknown list type");
  }

  const t = await getTranslations("Lists");
  const tDefinitions = await getTranslations("Lists.definitions");

  const items = await TripListItem.find({ tripId, listType }).lean();
  const sortedItems = sortTripListItemsForDisplay(
    items.map((item) => ({
      id: item._id.toString(),
      order: item.order,
      createdAt: item.createdAt,
    })),
  );

  const itemMap = new Map(
    items.map((item) => [item._id.toString(), toItemViewModel(item)]),
  );

  const progress: TripListProgress = {
    totalCount: items.length,
    completedCount: items.filter((item) => item.isCompleted).length,
  };

  return {
    type: definition.type,
    slug: definition.slug,
    title: tDefinitions(definition.type),
    progress,
    progressLabel: formatListProgressLabel(progress, (values) =>
      t("progressLabel", values),
    ),
    items: sortedItems
      .map((item) => itemMap.get(item.id))
      .filter((item): item is TripListItemViewModel => Boolean(item)),
  };
}
