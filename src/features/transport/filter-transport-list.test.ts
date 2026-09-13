import { describe, expect, it } from "vitest";
import {
  countTransportsByFilter,
  filterTransportList,
  getTransportFilterEmptyMessage,
} from "./filter-transport-list";
import type { TransportCardViewModel } from "./types";

function card(type: TransportCardViewModel["type"], id: string): TransportCardViewModel {
  return {
    id,
    type,
    typeLabel: type,
    routeLabel: "A → B",
    dateLabel: "25 Oct 2026",
    timeRangeLabel: "09:00 → 11:00",
    detailHref: `/transport/${id}`,
    departureDate: "2026-10-25",
    departureTime: "09:00",
    listTitle: "title",
    visualSrc: `/transport-visuals/${type === "taxi" || type === "car" ? "car" : type === "ferry" ? "ship" : type}.png`,
  };
}

describe("filterTransportList", () => {
  const transports = [
    card("flight", "f1"),
    card("flight", "f2"),
    card("train", "t1"),
    card("train", "t2"),
    card("bus", "b1"),
  ];

  it("filters by transport type groups", () => {
    expect(filterTransportList(transports, "all")).toHaveLength(5);
    expect(filterTransportList(transports, "flight").map((entry) => entry.id)).toEqual([
      "f1",
      "f2",
    ]);
    expect(filterTransportList(transports, "train").map((entry) => entry.id)).toEqual([
      "t1",
      "t2",
    ]);
    expect(filterTransportList(transports, "other").map((entry) => entry.id)).toEqual(["b1"]);
  });

  it("returns real filter counts", () => {
    expect(countTransportsByFilter(transports)).toEqual({
      all: 5,
      flight: 2,
      train: 2,
      other: 1,
    });
  });

  it("returns tab-specific empty messages", () => {
    expect(getTransportFilterEmptyMessage("flight")).toBe("אין עדיין טיסות בטיול הזה");
  });
});
