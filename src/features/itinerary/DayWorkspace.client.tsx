"use client";

import { DayTimeline, type ActivityPhotoMap } from "./DayTimeline.client";
import type { DayWorkspaceViewModel } from "./types";

type DayWorkspaceProps = {
  tripId: string;
  day: DayWorkspaceViewModel;
  activityPhotos?: ActivityPhotoMap;
  onEditActivity: (activityId: string) => void;
  onMoveActivity: (activityId: string) => void;
  onEditTransport: (transportId: string) => void;
};

export function DayWorkspace({
  tripId,
  day,
  activityPhotos,
  onEditActivity,
  onMoveActivity,
  onEditTransport,
}: DayWorkspaceProps) {
  return (
    <DayTimeline
      tripId={tripId}
      day={day}
      activityPhotos={activityPhotos}
      onEditActivity={onEditActivity}
      onMoveActivity={onMoveActivity}
      onEditTransport={onEditTransport}
    />
  );
}
