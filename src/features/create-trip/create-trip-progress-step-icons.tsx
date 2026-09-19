import type { ComponentType } from "react";
import {
  IconCalendar,
  IconMapPin,
  IconNavigation,
  IconPlane,
  IconSparkles,
} from "@/components/ui/icons";

export const CREATE_TRIP_PROGRESS_STEP_ICONS = [
  IconPlane,
  IconMapPin,
  IconNavigation,
  IconCalendar,
  IconSparkles,
] as const satisfies readonly ComponentType<{ className?: string }>[];

export function getCreateTripProgressStepIcon(
  stepIndex: number,
): ComponentType<{ className?: string }> {
  const clamped = Math.max(
    0,
    Math.min(stepIndex, CREATE_TRIP_PROGRESS_STEP_ICONS.length - 1),
  );
  return CREATE_TRIP_PROGRESS_STEP_ICONS[clamped]!;
}

export function CreateTripProgressStepIcon({
  stepIndex,
  className,
}: {
  stepIndex: number;
  className?: string;
}) {
  const index = Math.max(
    0,
    Math.min(stepIndex, CREATE_TRIP_PROGRESS_STEP_ICONS.length - 1),
  );

  switch (index) {
    case 0:
      return <IconPlane className={className} aria-hidden />;
    case 1:
      return <IconMapPin className={className} aria-hidden />;
    case 2:
      return <IconNavigation className={className} aria-hidden />;
    case 3:
      return <IconCalendar className={className} aria-hidden />;
    default:
      return <IconSparkles className={className} aria-hidden />;
  }
}
