import { resolveStoredActivityPlaceSource } from "./activity-place-domain";
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
  placeSource?: ActivityViewModel["placeSource"] | null;
  googlePlaceId?: string | null;
  locationName?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string | null;
  notes?: string | null;
};

function optionalString(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function optionalNumber(value: number | null | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function toActivityViewModel(activity: ActivityRecord): ActivityViewModel {
  const startTime = optionalString(activity.startTime);
  const endTime = optionalString(activity.endTime);
  const placeSource = resolveStoredActivityPlaceSource(activity.placeSource);

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
    placeSource,
    googlePlaceId: optionalString(activity.googlePlaceId),
    locationName: optionalString(activity.locationName),
    address: optionalString(activity.address),
    city: optionalString(activity.city),
    country: optionalString(activity.country),
    latitude: optionalNumber(activity.latitude),
    longitude: optionalNumber(activity.longitude),
    googleMapsUrl: optionalString(activity.googleMapsUrl),
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
    placeSource: activity.placeSource,
    googlePlaceId: activity.googlePlaceId ?? "",
    locationName: activity.locationName ?? "",
    address: activity.address ?? "",
    city: activity.city ?? "",
    country: activity.country ?? "",
    latitude: activity.latitude != null ? String(activity.latitude) : "",
    longitude: activity.longitude != null ? String(activity.longitude) : "",
    googleMapsUrl: activity.googleMapsUrl ?? "",
    notes: activity.notes ?? "",
  };
}

export function emptyActivityFormValues(
  overrides: Partial<ActivityFormValues> = {},
): ActivityFormValues {
  return {
    date: "",
    title: "",
    type: "attraction",
    startTime: "",
    endTime: "",
    placeSource: "manual",
    googlePlaceId: "",
    locationName: "",
    address: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
    googleMapsUrl: "",
    notes: "",
    ...overrides,
  };
}
