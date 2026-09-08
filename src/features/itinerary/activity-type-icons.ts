import type { ComponentType } from "react";
import {
  IconActivityAttraction,
  IconActivityFreeTime,
  IconActivityHotel,
  IconActivityOther,
  IconActivityRestaurant,
  IconActivityShopping,
  IconActivityTransport,
} from "@/components/ui/icons";
import type { ActivityType } from "./activity-types";

export const ACTIVITY_TYPE_ICONS: Record<
  ActivityType,
  ComponentType<{ className?: string }>
> = {
  attraction: IconActivityAttraction,
  transport: IconActivityTransport,
  restaurant: IconActivityRestaurant,
  hotel: IconActivityHotel,
  freeTime: IconActivityFreeTime,
  shopping: IconActivityShopping,
  other: IconActivityOther,
};
