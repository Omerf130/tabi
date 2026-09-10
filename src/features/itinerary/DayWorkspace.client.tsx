"use client";

import { DayTimeline } from "./DayTimeline.client";
import type { DayWorkspaceViewModel } from "./types";

type DayWorkspaceProps = {
  tripId: string;
  day: DayWorkspaceViewModel;
  onEditActivity: (activityId: string) => void;
  onMoveActivity: (activityId: string) => void;
  onEditTransport: (transportId: string) => void;
};

export function DayWorkspace({
  tripId,
  day,
  onEditActivity,
  onMoveActivity,
  onEditTransport,
}: DayWorkspaceProps) {
  return (
    <DayTimeline
      tripId={tripId}
      day={day}
      onEditActivity={onEditActivity}
      onMoveActivity={onMoveActivity}
      onEditTransport={onEditTransport}
    />
  );
}
