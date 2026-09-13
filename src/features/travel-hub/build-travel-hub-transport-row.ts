import { buildTransportHref } from "@/features/transport/constants";
import type { TransportRecord } from "@/features/transport/types";
import { TRAVEL_HUB_TRANSPORT } from "./constants";
import type { TravelHubPrimaryToolRow } from "./types";

type BuildTravelHubTransportRowInput = {
  tripId: string;
  transports: readonly TransportRecord[];
};

export function buildTravelHubTransportRow({
  tripId,
  transports,
}: BuildTravelHubTransportRowInput): TravelHubPrimaryToolRow {
  const count = transports.length;
  const countLabel =
    count === 0
      ? null
      : count === 1
        ? TRAVEL_HUB_TRANSPORT.countOne
        : TRAVEL_HUB_TRANSPORT.countMany(count);

  return {
    href: buildTransportHref(tripId),
    title: TRAVEL_HUB_TRANSPORT.title,
    countLabel,
    detailLine: null,
    emptyLine: count === 0 ? TRAVEL_HUB_TRANSPORT.emptyLine : null,
  };
}
