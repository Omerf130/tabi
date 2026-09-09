import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/app/trips/[tripId]/currency/rate/route";

const {
  requireTripMemberMock,
  getSupportedCurrenciesMock,
  getExchangeRateMock,
} = vi.hoisted(() => ({
  requireTripMemberMock: vi.fn(),
  getSupportedCurrenciesMock: vi.fn(),
  getExchangeRateMock: vi.fn(),
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripMember: requireTripMemberMock,
}));

vi.mock("@/features/currency/queries", () => ({
  getSupportedCurrencies: getSupportedCurrenciesMock,
  getExchangeRate: getExchangeRateMock,
}));

const tripId = "507f1f77bcf86cd799439011";

const supported = [
  {
    code: "JPY",
    symbol: "¥",
    englishName: "Japanese Yen",
    hebrewName: "ין יפני",
  },
  {
    code: "ILS",
    symbol: "₪",
    englishName: "Israeli New Shekel",
    hebrewName: "שקל ישראלי",
  },
  {
    code: "USD",
    symbol: "$",
    englishName: "United States Dollar",
    hebrewName: "דולר אמריקאי",
  },
];

describe("currency rate route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTripMemberMock.mockResolvedValue({ id: tripId, role: "member" });
    getSupportedCurrenciesMock.mockResolvedValue(supported);
    getExchangeRateMock.mockResolvedValue({
      from: "JPY",
      to: "ILS",
      rate: 0.0196,
      date: "2026-09-09",
    });
  });

  it("allows trip members to fetch supported pairs", async () => {
    const response = await GET(
      new Request(
        `http://localhost/app/trips/${tripId}/currency/rate?from=JPY&to=ILS`,
      ),
      { params: Promise.resolve({ tripId }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      from: "JPY",
      to: "ILS",
      rate: 0.0196,
      date: "2026-09-09",
    });
    expect(requireTripMemberMock).toHaveBeenCalledWith(tripId);
  });

  it("rejects invalid query params", async () => {
    const response = await GET(
      new Request(
        `http://localhost/app/trips/${tripId}/currency/rate?from=JPY&to=JPY`,
      ),
      { params: Promise.resolve({ tripId }) },
    );

    expect(response.status).toBe(400);
  });

  it("rejects unsupported currency codes", async () => {
    const response = await GET(
      new Request(
        `http://localhost/app/trips/${tripId}/currency/rate?from=XXX&to=ILS`,
      ),
      { params: Promise.resolve({ tripId }) },
    );

    expect(response.status).toBe(400);
  });

  it("returns provider failures as 502", async () => {
    const { FrankfurterRequestError } = await import("./frankfurter.server");
    getExchangeRateMock.mockRejectedValue(
      new FrankfurterRequestError("Provider unavailable"),
    );

    const response = await GET(
      new Request(
        `http://localhost/app/trips/${tripId}/currency/rate?from=USD&to=ILS`,
      ),
      { params: Promise.resolve({ tripId }) },
    );

    expect(response.status).toBe(502);
  });
});
