import type { TransportType } from "./transport-types";

const TRANSPORT_VISUAL_SRC: Record<TransportType, string> = {
  flight: "/transport-visuals/flight.png",
  train: "/transport-visuals/train.png",
  bus: "/transport-visuals/bus.png",
  car: "/transport-visuals/car.png",
  taxi: "/transport-visuals/car.png",
  ferry: "/transport-visuals/ship.png",
};

export function resolveTransportVisualSrc(type: TransportType): string {
  return TRANSPORT_VISUAL_SRC[type];
}
