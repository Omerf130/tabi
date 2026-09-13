import { describe, expect, it } from "vitest";
import { TRANSPORT_TYPES } from "./transport-types";
import { flattenTransportCards } from "./flatten-transport-cards";
import type { TransportCardViewModel } from "./types";

function card(
  overrides: Partial<TransportCardViewModel> & Pick<TransportCardViewModel, "id">,
): TransportCardViewModel {
  return {
    type: "train",
    typeLabel: "רכבת",
    routeLabel: "Tokyo → Kyoto",
    dateLabel: "25 Oct 2026",
    timeRangeLabel: "09:00 → 11:00",
    detailHref: `/app/trips/trip/transport/${overrides.id}`,
    departureDate: "2026-10-25",
    departureTime: "09:00",
    listTitle: "רכבת לKyoto",
    visualSrc: "/transport-visuals/train.png",
    ...overrides,
  };
}

describe("flattenTransportCards", () => {
  it("flattens grouped transports and sorts chronologically", () => {
    const grouped = Object.fromEntries(
      TRANSPORT_TYPES.map((type) => [type, [] as TransportCardViewModel[]]),
    ) as Record<(typeof TRANSPORT_TYPES)[number], TransportCardViewModel[]>;

    grouped.flight.push(
      card({ id: "flight", type: "flight", departureDate: "2026-10-24", departureTime: "08:00" }),
    );
    grouped.train.push(
      card({ id: "train-late", departureDate: "2026-10-25", departureTime: "15:00" }),
      card({ id: "train-early", departureDate: "2026-10-25", departureTime: "09:00" }),
    );

    expect(flattenTransportCards(grouped).map((entry) => entry.id)).toEqual([
      "flight",
      "train-early",
      "train-late",
    ]);
  });
});
