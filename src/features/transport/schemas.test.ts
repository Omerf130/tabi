import { describe, expect, it } from "vitest";
import { createTransportSchema, parseTransportTypeParam } from "./schemas";

const validEndpoint = {
  locationName: "Tokyo",
  locationCode: "HND",
  date: "2026-10-25",
  time: "09:00",
  timezone: "Asia/Tokyo",
};

describe("transport schemas", () => {
  it("accepts valid flight transport", () => {
    const result = createTransportSchema.safeParse({
      type: "flight",
      departure: validEndpoint,
      arrival: { ...validEndpoint, time: "12:00", locationName: "Osaka" },
      details: {
        airline: "JAL",
        flightNumber: "123",
        departureTerminal: undefined,
        arrivalTerminal: undefined,
        gate: undefined,
        seat: undefined,
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid chronology", () => {
    const result = createTransportSchema.safeParse({
      type: "bus",
      departure: validEndpoint,
      arrival: { ...validEndpoint, time: "08:59" },
      details: {
        operator: undefined,
        serviceNumber: undefined,
        vehicleOrServiceNotes: undefined,
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects unsupported timezone", () => {
    const result = createTransportSchema.safeParse({
      type: "taxi",
      departure: { ...validEndpoint, timezone: "Invalid/Zone" },
      arrival: { ...validEndpoint, time: "10:00" },
      details: {
        operator: undefined,
        serviceNumber: undefined,
        vehicleOrServiceNotes: undefined,
      },
    });

    expect(result.success).toBe(false);
  });

  it("parses transport type param", () => {
    expect(parseTransportTypeParam("train")).toBe("train");
    expect(parseTransportTypeParam("invalid")).toBeNull();
  });
});
