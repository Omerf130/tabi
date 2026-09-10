import { describe, expect, it } from "vitest";
import { MY_TRIPS_FALLBACK_VISUAL } from "./constants";
import { buildMyTripsCards } from "./build-my-trips-cards";

const todayJapan = "2026-10-01";

describe("buildMyTripsCards", () => {
  it("returns an empty collection for zero trips", () => {
    expect(buildMyTripsCards([], new Map(), todayJapan)).toEqual([]);
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
      todayJapan,
    );

    expect(cards).toHaveLength(1);
    expect(cards[0]?.name).toBe("Japan Spring");
    expect(cards[0]?.imageSrc).toBe(MY_TRIPS_FALLBACK_VISUAL);
  });

  it("builds multiple cards with workspace links", () => {
    const trips = [
      {
        _id: { toString: () => "507f1f77bcf86cd799439011" },
        name: "Japan Spring",
        startDate: "2026-11-01",
        endDate: "2026-11-14",
      },
      {
        _id: { toString: () => "507f1f77bcf86cd799439012" },
        name: "Europe Summer",
        startDate: "2026-12-01",
        endDate: "2026-12-20",
      },
    ];

    const cards = buildMyTripsCards(
      trips,
      new Map([
        ["507f1f77bcf86cd799439011", "owner"],
        ["507f1f77bcf86cd799439012", "member"],
      ]),
      todayJapan,
    );

    expect(cards).toHaveLength(2);
    expect(cards.map((card) => card.id)).toEqual([
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012",
    ]);
  });

  it("uses the persisted cover route when coverImage exists", () => {
    const cards = buildMyTripsCards(
      [
        {
          _id: { toString: () => "507f1f77bcf86cd799439011" },
          name: "Japan Spring",
          startDate: "2026-11-01",
          endDate: "2026-11-14",
          coverImage: {
            pathname: "trips/507f1f77bcf86cd799439011/cover.webp",
            contentType: "image/webp",
          },
        },
      ],
      new Map([["507f1f77bcf86cd799439011", "owner"]]),
      todayJapan,
    );

    expect(cards[0]?.imageSrc).toBe(
      "/app/trips/507f1f77bcf86cd799439011/cover",
    );
    expect(cards[0]?.hasPersistedCover).toBe(true);
  });

  it("uses coverVisualKey when no uploaded cover exists", () => {
    const cards = buildMyTripsCards(
      [
        {
          _id: { toString: () => "507f1f77bcf86cd799439011" },
          name: "Japan Spring",
          startDate: "2026-11-01",
          endDate: "2026-11-14",
          coverVisualKey: "europe-02",
        },
      ],
      new Map([["507f1f77bcf86cd799439011", "owner"]]),
      todayJapan,
    );

    expect(cards[0]?.imageSrc).toBe("/destination-visuals/europe02.png");
  });
});
