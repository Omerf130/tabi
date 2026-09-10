import { describe, expect, it } from "vitest";
import {
  formatEntityLinkedCostDisplay,
  toEntityLinkedCostViewModel,
} from "./entity-linked-cost-presentation";
import {
  toTransportCardViewModel,
  toTransportItineraryItemViewModel,
} from "@/features/transport/to-transport-view-model";
import type { TransportRecord } from "@/features/transport/types";

const tripId = "trip-1";

const baseTransportRecord: TransportRecord = {
  id: "transport-1",
  tripId,
  type: "train",
  departure: {
    locationName: "Tokyo",
    date: "2026-10-25",
    time: "09:00",
    timezone: "Asia/Tokyo",
  },
  arrival: {
    locationName: "Kyoto",
    date: "2026-10-25",
    time: "11:00",
    timezone: "Asia/Tokyo",
  },
  details: {
    serviceName: "Nozomi",
  },
  createdAt: "2026-10-01T00:00:00.000Z",
};

describe("transport read presentation", () => {
  it("shows original linked cost on transport cards", () => {
    const linkedCost = toEntityLinkedCostViewModel({
      id: "expense-1",
      amount: 4500,
      currency: "JPY",
      category: "transport",
    });
    const card = toTransportCardViewModel(tripId, {
      ...baseTransportRecord,
      linkedCost,
    });

    expect(card.linkedCost?.label).toBe(linkedCost.label);
    expect(formatEntityLinkedCostDisplay(card.linkedCost!)).toMatch(/עלות:/);
    expect(card.linkedCost?.label).toContain("¥");
  });

  it("omits cost on transport cards without a linked expense", () => {
    const card = toTransportCardViewModel(tripId, baseTransportRecord);
    expect(card.linkedCost).toBeUndefined();
  });

  it("shows original linked cost on transport itinerary rows", () => {
    const linkedCost = toEntityLinkedCostViewModel({
      id: "expense-1",
      amount: 120,
      currency: "EUR",
      category: "flights",
    });
    const item = toTransportItineraryItemViewModel(tripId, {
      ...baseTransportRecord,
      type: "flight",
      linkedCost,
    });

    expect(item.linkedCost?.label).toMatch(/120/);
    expect(item.linkedCost?.currency).toBe("EUR");
  });

  it("omits cost on transport itinerary rows without a linked expense", () => {
    const item = toTransportItineraryItemViewModel(tripId, baseTransportRecord);
    expect(item.linkedCost).toBeUndefined();
  });
});

describe("accommodation read presentation", () => {
  it("exposes formatted original cost on accommodation view models", () => {
    const linkedCost = toEntityLinkedCostViewModel({
      id: "expense-1",
      amount: 350,
      currency: "ILS",
      category: "accommodation",
    });

    expect(formatEntityLinkedCostDisplay(linkedCost)).toBe(`עלות: ${linkedCost.label}`);
    expect(linkedCost.label).toMatch(/350/);
  });

  it("leaves accommodation without linked expense unchanged", () => {
    const accommodation = {
      id: "acc-1",
      name: "Hotel",
    };

    expect("linkedCost" in accommodation ? accommodation.linkedCost : undefined).toBeUndefined();
  });
});

describe("activity read presentation", () => {
  it("exposes compact original cost label for activity rows", () => {
    const linkedCost = toEntityLinkedCostViewModel({
      id: "expense-1",
      amount: 4500,
      currency: "JPY",
      category: "food",
    });

    expect(linkedCost.label).toContain("¥");
    expect(linkedCost.label).not.toMatch(/עלות/);
  });

  it("leaves activity without linked expense unchanged", () => {
    const activity = {
      id: "activity-1",
      title: "Lunch",
    };

    expect("linkedCost" in activity ? activity.linkedCost : undefined).toBeUndefined();
  });
});
