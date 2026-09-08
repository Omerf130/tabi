import { beforeEach, describe, expect, it, vi } from "vitest";
import { listTravelDocumentsForTrip } from "./queries";

const {
  travelDocumentFindMock,
  activityFindOneMock,
  accommodationFindOneMock,
  resolveAccommodationIdentityMock,
} = vi.hoisted(() => ({
  travelDocumentFindMock: vi.fn(),
  activityFindOneMock: vi.fn(),
  accommodationFindOneMock: vi.fn(),
  resolveAccommodationIdentityMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/models/TravelDocument", () => ({
  TravelDocument: {
    find: travelDocumentFindMock,
  },
}));

vi.mock("@/models/Activity", () => ({
  Activity: {
    findOne: activityFindOneMock,
  },
}));

vi.mock("@/models/Accommodation", () => ({
  Accommodation: {
    findOne: accommodationFindOneMock,
  },
}));

vi.mock("@/features/accommodations/resolve-accommodation-identity", () => ({
  resolveAccommodationIdentity: resolveAccommodationIdentityMock,
}));

describe("travel document queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveAccommodationIdentityMock.mockResolvedValue({
      name: "Hotel",
      city: "Tokyo",
      placeSource: "manual",
    });
  });

  it("lists documents with categories and file labels", async () => {
    travelDocumentFindMock.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: { toString: () => "507f1f77bcf86cd799439012" },
            tripId: { toString: () => "507f1f77bcf86cd799439011" },
            category: "flight",
            title: "Boarding pass",
            file: { contentType: "application/pdf" },
            createdAt: new Date("2026-10-25T10:00:00.000Z"),
          },
        ]),
      }),
    });
    activityFindOneMock.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });
    accommodationFindOneMock.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });

    const documents = await listTravelDocumentsForTrip("507f1f77bcf86cd799439011");

    expect(documents).toHaveLength(1);
    expect(documents[0]?.categoryLabel).toBe("טיסות");
    expect(documents[0]?.fileTypeLabel).toBe("PDF");
  });

  it("gracefully hides stale activity links", async () => {
    travelDocumentFindMock.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: { toString: () => "507f1f77bcf86cd799439012" },
            tripId: { toString: () => "507f1f77bcf86cd799439011" },
            category: "ticket",
            title: "Museum ticket",
            activityId: { toString: () => "507f1f77bcf86cd799439013" },
            file: { contentType: "image/jpeg" },
            createdAt: new Date("2026-10-25T10:00:00.000Z"),
          },
        ]),
      }),
    });
    activityFindOneMock.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });

    const documents = await listTravelDocumentsForTrip("507f1f77bcf86cd799439011");

    expect(documents[0]?.contextLink).toBeUndefined();
    expect(documents[0]?.title).toBe("Museum ticket");
  });

  it("resolves valid activity context labels", async () => {
    travelDocumentFindMock.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: { toString: () => "507f1f77bcf86cd799439012" },
            tripId: { toString: () => "507f1f77bcf86cd799439011" },
            category: "ticket",
            title: "Museum ticket",
            activityId: { toString: () => "507f1f77bcf86cd799439013" },
            file: { contentType: "image/jpeg" },
            createdAt: new Date("2026-10-25T10:00:00.000Z"),
          },
        ]),
      }),
    });
    activityFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: { toString: () => "507f1f77bcf86cd799439013" },
        title: "TeamLab",
        date: "2026-10-26",
        type: "attraction",
      }),
    });

    const documents = await listTravelDocumentsForTrip("507f1f77bcf86cd799439011");

    expect(documents[0]?.contextLink).toEqual(
      expect.objectContaining({
        type: "activity",
        title: "TeamLab",
        date: "2026-10-26",
      }),
    );
  });
});
