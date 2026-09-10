import { buildListsLandingHref } from "@/features/lists/constants";
import type { TripListType } from "@/features/lists/constants";
import type {
  TripListItemViewModel,
  TripListSummaryViewModel,
} from "@/features/lists/types";
import { compareTripListItemsForDisplay } from "@/features/lists/list-item-order";

export const PREPARATION_LIST_TYPES = [
  "packing",
  "before_trip",
  "pre_trip_shopping",
] as const satisfies readonly TripListType[];

export const PREPARATION_PREVIEW_ITEM_LIMIT = 4;

const PREPARATION_TYPE_PRIORITY: Record<
  (typeof PREPARATION_LIST_TYPES)[number],
  number
> = {
  before_trip: 0,
  pre_trip_shopping: 1,
  packing: 2,
};

export type HomePreparationPreviewItem = {
  id: string;
  text: string;
  isCompleted: boolean;
  listType: TripListType;
};

export type HomePreparationViewModel = {
  totalCount: number;
  completedCount: number;
  remainingCount: number;
  percentage: number | null;
  progressLabel: string;
  previewItems: HomePreparationPreviewItem[];
  listsHref: string;
};

function isPreparationListType(
  listType: TripListType,
): listType is (typeof PREPARATION_LIST_TYPES)[number] {
  return PREPARATION_LIST_TYPES.includes(
    listType as (typeof PREPARATION_LIST_TYPES)[number],
  );
}

function comparePreparationPreviewItems(
  a: HomePreparationPreviewItem,
  b: HomePreparationPreviewItem,
): number {
  if (a.isCompleted !== b.isCompleted) {
    return a.isCompleted ? -1 : 1;
  }

  const priorityDiff =
    PREPARATION_TYPE_PRIORITY[
      a.listType as (typeof PREPARATION_LIST_TYPES)[number]
    ] -
    PREPARATION_TYPE_PRIORITY[
      b.listType as (typeof PREPARATION_LIST_TYPES)[number]
    ];
  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  return a.text.localeCompare(b.text, "he");
}

export function buildHomePreparation(
  tripId: string,
  lists: readonly TripListSummaryViewModel[],
  listItems: readonly TripListItemViewModel[],
): HomePreparationViewModel | null {
  const listByType = new Map(lists.map((list) => [list.type, list]));
  let totalCount = 0;
  let completedCount = 0;

  for (const type of PREPARATION_LIST_TYPES) {
    const progress = listByType.get(type)?.progress;
    if (!progress) {
      continue;
    }
    totalCount += progress.totalCount;
    completedCount += progress.completedCount;
  }

  if (totalCount === 0) {
    return null;
  }

  const remainingCount = totalCount - completedCount;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const previewItems = listItems
    .filter((item) => isPreparationListType(item.listType))
    .sort((left, right) => {
      const byPreview = comparePreparationPreviewItems(
        {
          id: left.id,
          text: left.text,
          isCompleted: left.isCompleted,
          listType: left.listType,
        },
        {
          id: right.id,
          text: right.text,
          isCompleted: right.isCompleted,
          listType: right.listType,
        },
      );
      if (byPreview !== 0) {
        return byPreview;
      }

      return compareTripListItemsForDisplay(left, right);
    })
    .slice(0, PREPARATION_PREVIEW_ITEM_LIMIT)
    .map((item) => ({
      id: item.id,
      text: item.text,
      isCompleted: item.isCompleted,
      listType: item.listType,
    }));

  return {
    totalCount,
    completedCount,
    remainingCount,
    percentage,
    progressLabel: `${completedCount} מתוך ${totalCount} הושלמו`,
    previewItems,
    listsHref: buildListsLandingHref(tripId),
  };
}
