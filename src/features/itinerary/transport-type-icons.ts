import {
  IconBus,
  IconCar,
  IconFerry,
  IconPlane,
  IconTaxi,
  IconTrain,
} from "@/components/ui/icons";
import {
  TRANSPORT_TYPES,
  type TransportType,
} from "@/features/transport/transport-types";

export const TRANSPORT_TYPE_ICON_NAMES: Record<TransportType, string> = {
  train: "IconTrain",
  flight: "IconPlane",
  bus: "IconBus",
  car: "IconCar",
  taxi: "IconTaxi",
  ferry: "IconFerry",
};

export const TRANSPORT_TYPE_ICONS = {
  train: IconTrain,
  flight: IconPlane,
  bus: IconBus,
  car: IconCar,
  taxi: IconTaxi,
  ferry: IconFerry,
} as const satisfies Record<TransportType, typeof IconTrain>;

export function getTransportTypeIconNames(): readonly string[] {
  return TRANSPORT_TYPES.map((type) => TRANSPORT_TYPE_ICON_NAMES[type]);
}
