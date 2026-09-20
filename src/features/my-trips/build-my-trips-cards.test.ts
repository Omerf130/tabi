import { describe, expect, it } from "vitest";
import { MY_TRIPS_FALLBACK_VISUAL } from "./constants";
import { buildMyTripsCards } from "./build-my-trips-cards";

const todayTripLocalByTripId = new Map([
  ["507f1f77bcf86cd799439011", "2026-10-01"],
  ["507f1f77bcf86cd799439012", "2026-10-01"],
  ["507f1f77bcf86cd799439013", "2026-10-01"],
]);

describe("buildMyTripsCards", () => {
  it("returns an empty collection for zero trips", () => {
    expect(buildMyTripsCards([], new Map(), new Map())).toEqual([]);
  });

  it("builds card items only for trips with membership roles", () => {
    const trips = [
      {
        _id: { toString: () => "507f1f77bcf86cd799439011" },
        name: "Japan Spring",
        startDate: "2026-11-01",
        endDate: "2026-11-14",
      },
      {
        _id: { toString: () => "507f1f77bcf86cd799439012" },
        name: "Hidden Trip",
        startDate: "2026-12-01",
        endDate: "2026-12-10",
      },
    ];

    const cards = buildMyTripsCards(
      trips,
      new Map([["507f1f77bcf86cd799439011", "owner"]]),
      todayTripLocalByTripId,
    );

    expect(cards).toHaveLength(1);
    expect(cards[0]?.name).toBe("Japan Spring");
    expect(cards[0]?.imageSrc).toBe(MY_TRIPS_FALLBACK_VISUAL);
  });

  it("builds multiple cards with workspace links", () => {
    const trips = [
      {
        _id: { toString: () => "507f1f77bcf86cd799439011" },
        name: "Trip A",
        startDate: "2026-11-01",
        endDate: "2026-11-14",
      },
      {
        _id: { toString: () => "507f1f77bcf86cd799439013" },
        name: "Trip B",
        startDate: "2026-12-01",
        endDate: "2026-12-10",
      },
    ];

    const cards = buildMyTripsCards(
      trips,
      new Map([
        ["507f1f77bcf86cd799439011", "owner"],
        ["507f1f77bcf86cd799439013", "member"],
      ]),
      todayTripLocalByTripId,
    );

    expect(cards).toHaveLength(2);
    expect(cards.map((card) => card.name)).toEqual(["Trip A", "Trip B"]);
  });

  it("uses persisted cover visual key when present", () => {
    const cards = buildMyTripsCards(
      [
        {
          _id: { toString: () => "507f1f77bcf86cd799439011" },
          name: "Visual Trip",
          startDate: "2026-11-01",
          endDate: "2026-11-14",
          coverVisualKey: "europe-02",
        },
      ],
      new Map([["507f1f77bcf86cd799439011", "owner"]]),
      todayTripLocalByTripId,
    );

    expect(cards[0]?.imageSrc).toBe("/destination-visuals/europe02.png");
  });

  it("sorts cards using trip list ordering rules", () => {
    const cards = buildMyTripsCards(
      [
        {
          _id: { toString: () => "507f1f77bcf86cd799439012" },
          name: "Later",
          startDate: "2026-12-01",
          endDate: "2026-12-10",
        },
        {
          _id: { toString: () => "507f1f77bcf86cd799439011" },
          name: "Sooner",
          startDate: "2026-11-01",
          endDate: "2026-11-14",
        },
      ],
      new Map([
        ["507f1f77bcf86cd799439011", "owner"],
        ["507f1f77bcf86cd799439012", "owner"],
      ]),
      todayTripLocalByTripId,
    );

    expect(cards[0]?.name).toBe("Sooner");
    expect(cards[1]?.name).toBe("Later");
  });
});
