import { describe, expect, it } from "vitest";
import {
  weatherLocationRefSchema,
  weatherSearchQuerySchema,
  weatherSnapshotQuerySchema,
} from "./schemas";

describe("weather schemas", () => {
  it("validates search query length", () => {
    expect(weatherSearchQuerySchema.safeParse({ q: "to" }).success).toBe(false);
    expect(weatherSearchQuerySchema.safeParse({ q: "tok" }).success).toBe(true);
  });

  it("validates latitude and longitude boundaries", () => {
    expect(weatherSnapshotQuerySchema.safeParse({ latitude: 91, longitude: 0 }).success).toBe(
      false,
    );
    expect(weatherSnapshotQuerySchema.safeParse({ latitude: -91, longitude: 0 }).success).toBe(
      false,
    );
    expect(weatherSnapshotQuerySchema.safeParse({ latitude: 0, longitude: 181 }).success).toBe(
      false,
    );
    expect(weatherSnapshotQuerySchema.safeParse({ latitude: 0, longitude: -181 }).success).toBe(
      false,
    );
    expect(
      weatherSnapshotQuerySchema.safeParse({ latitude: 35.6895, longitude: 139.6917 }).success,
    ).toBe(true);
  });

  it("validates stored location preferences", () => {
    expect(
      weatherLocationRefSchema.safeParse({
        label: "Tokyo",
        region: "Tokyo",
        country: "Japan",
        latitude: 35.6895,
        longitude: 139.6917,
      }).success,
    ).toBe(true);
  });
});
