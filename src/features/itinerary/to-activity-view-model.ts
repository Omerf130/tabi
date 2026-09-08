import { ACTIVITY_TYPE_LABELS } from "./activity-types";
import { formatActivityTimeDisplay } from "./time";
import type { ActivityFormValues, ActivityViewModel } from "./types";

type ActivityRecord = {
  _id: { toString(): string };
  date: string;
  title: string;
  type: ActivityViewModel["type"];
  order: number;
  startTime?: string | null;
  endTime?: string | null;
  locationName?: string | null;
  address?: string | null;
  notes?: string | null;
};

function optionalString(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function toActivityViewModel(activity: ActivityRecord): ActivityViewModel {
  const startTime = optionalString(activity.startTime);
  const endTime = optionalString(activity.endTime);

  return {
    id: activity._id.toString(),
    date: activity.date,
    title: activity.title,
    type: activity.type,
    typeLabel: ACTIVITY_TYPE_LABELS[activity.type],
    order: activity.order,
    startTime,
    endTime,
    timeLabel: formatActivityTimeDisplay(startTime, endTime),
    locationName: optionalString(activity.locationName),
    address: optionalString(activity.address),
    notes: optionalString(activity.notes),
  };
}

export function toActivityFormValues(activity: ActivityViewModel): ActivityFormValues {
  return {
    date: activity.date,
    title: activity.title,
    type: activity.type,
    startTime: activity.startTime ?? "",
    endTime: activity.endTime ?? "",
    locationName: activity.locationName ?? "",
    address: activity.address ?? "",
    notes: activity.notes ?? "",
  };
}
