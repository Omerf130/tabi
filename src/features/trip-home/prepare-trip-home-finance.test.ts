import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildTestNoExpensesRecap } from "@/features/finance/after-trip-finance-recap-fixture";
import { prepareTripHomePage } from "./prepare-trip-home-page";

const { prepareAfterTripFinanceRecapMock, resolveTripHomePreviewContextMock } =
  vi.hoisted(() => ({
    prepareAfterTripFinanceRecapMock: vi.fn(),
    resolveTripHomePreviewContextMock: vi.fn(),
  }));

vi.mock("@/features/finance/queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/finance/queries")>();
  return {
    ...actual,
    prepareAfterTripFinanceRecap: prepareAfterTripFinanceRecapMock,
  };
});

vi.mock("@/features/accommodations/queries", () => ({
  listAccommodationsForTrip: vi.fn(async () => []),
}));

vi.mock("@/features/itinerary/queries", () => ({
  listActivitiesForTripDay: vi.fn(async () => []),
}));

vi.mock("@/features/transport/queries", () => ({
  listTransportsForItineraryDay: vi.fn(async () => []),
  listTransportsForTrip: vi.fn(async () => []),
}));

vi.mock("@/features/lists/queries", () => ({
  listTripListsSummary: vi.fn(async () => []),
  listTripListItemsForTypes: vi.fn(async () => []),
}));

vi.mock("@/features/trips/reminders/queries", () => ({
  listIncompleteRemindersForUserTrip: vi.fn(async () => []),
  listIncompleteRemindersForUserTripDay: vi.fn(async () => []),
}));

vi.mock("@/features/weather/queries", () => ({
  getWeatherSnapshot: vi.fn(),
}));

vi.mock("@/features/itinerary/resolve-day-location.server", () => ({
  resolveDayLocation: vi.fn(async () => null),
}));

vi.mock("./resolve-trip-home-preview-context", () => ({
  resolveTripHomePreviewContext: resolveTripHomePreviewContextMock,
}));

const trip = {
  id: "507f1f77bcf86cd799439011",
  name: "Japan 2026",
  startDate: "2026-10-25",
  endDate: "2026-11-18",
  coverVisualKey: "japan-01",
  role: "owner" as const,
};

describe("prepareTripHomePage finance loading", () => {
  beforeEach(() => {
    prepareAfterTripFinanceRecapMock.mockReset();
    prepareAfterTripFinanceRecapMock.mockResolvedValue(buildTestNoExpensesRecap());
    resolveTripHomePreviewContextMock.mockReset();
  });

  it("loads finance recap for completed trip home", async () => {
    resolveTripHomePreviewContextMock.mockReturnValue({
      todayJapan: "2026-12-01",
      nowJapanTime: "12:00",
      isPreview: false,
    });

    const model = await prepareTripHomePage(trip, "user-1", {
      previewPhase: "after",
    });

    expect(model.phase).toBe("completed");
    expect(prepareAfterTripFinanceRecapMock).toHaveBeenCalledTimes(1);
    expect(prepareAfterTripFinanceRecapMock).toHaveBeenCalledWith(trip.id);
    if (model.phase !== "completed") {
      return;
    }
    expect(model.financeRecap.variant).toBe("noExpenses");
  });

  it("does not load finance recap for before trip home", async () => {
    resolveTripHomePreviewContextMock.mockReturnValue({
      todayJapan: "2026-10-01",
      nowJapanTime: "12:00",
      isPreview: false,
    });

    const model = await prepareTripHomePage(trip, "user-1", {
      previewPhase: "before",
    });

    expect(model.phase).toBe("upcoming");
    expect(prepareAfterTripFinanceRecapMock).not.toHaveBeenCalled();
  });

  it("does not load finance recap for during trip home", async () => {
    resolveTripHomePreviewContextMock.mockReturnValue({
      todayJapan: "2026-11-01",
      nowJapanTime: "12:00",
      isPreview: false,
    });

    const model = await prepareTripHomePage(trip, "user-1", {
      previewPhase: "during",
    });

    expect(model.phase).toBe("active");
    expect(prepareAfterTripFinanceRecapMock).not.toHaveBeenCalled();
  });
});
