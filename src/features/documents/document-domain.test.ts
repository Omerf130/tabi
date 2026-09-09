import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  TravelDocumentNotFoundError,
  TravelDocumentValidationError,
  createTravelDocument,
  deleteTravelDocument,
  replaceTravelDocumentFile,
  updateTravelDocumentMetadata,
} from "./document-domain";

const {
  uploadTravelDocumentBlobMock,
  deleteTravelDocumentBlobMock,
  travelDocumentCreateMock,
  travelDocumentFindOneAndUpdateMock,
  travelDocumentFindOneAndDeleteMock,
  travelDocumentFindOneMock,
  activityFindOneMock,
  accommodationFindOneMock,
  transportFindOneMock,
} = vi.hoisted(() => ({
  uploadTravelDocumentBlobMock: vi.fn(),
  deleteTravelDocumentBlobMock: vi.fn(),
  travelDocumentCreateMock: vi.fn(),
  travelDocumentFindOneAndUpdateMock: vi.fn(),
  travelDocumentFindOneAndDeleteMock: vi.fn(),
  travelDocumentFindOneMock: vi.fn(),
  activityFindOneMock: vi.fn(),
  accommodationFindOneMock: vi.fn(),
  transportFindOneMock: vi.fn(),
}));

vi.mock("./blob-storage", () => ({
  uploadTravelDocumentBlob: uploadTravelDocumentBlobMock,
  deleteTravelDocumentBlob: deleteTravelDocumentBlobMock,
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/models/TravelDocument", () => ({
  TravelDocument: {
    create: travelDocumentCreateMock,
    findOneAndUpdate: travelDocumentFindOneAndUpdateMock,
    findOneAndDelete: travelDocumentFindOneAndDeleteMock,
    findOne: travelDocumentFindOneMock,
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

vi.mock("@/models/Transport", () => ({
  Transport: {
    findOne: transportFindOneMock,
  },
}));

const tripId = "507f1f77bcf86cd799439011";
const documentId = "507f1f77bcf86cd799439012";
const activityId = "507f1f77bcf86cd799439013";
const transportId = "507f1f77bcf86cd799439014";
const otherTripActivityId = "507f1f77bcf86cd799439015";

describe("travel document domain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadTravelDocumentBlobMock.mockResolvedValue({
      pathname: "trips/trip/documents/doc/file",
      contentType: "application/pdf",
    });
    deleteTravelDocumentBlobMock.mockResolvedValue(undefined);
    travelDocumentCreateMock.mockResolvedValue({ _id: { toString: () => documentId } });
    travelDocumentFindOneAndUpdateMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: documentId }),
    });
    travelDocumentFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: documentId,
        file: { pathname: "old-path", originalFilename: "old.pdf" },
      }),
    });
    travelDocumentFindOneAndDeleteMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        file: { pathname: "deleted-path" },
      }),
    });
    activityFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: activityId }),
    });
    accommodationFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });
    transportFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: transportId }),
    });
  });

  it("creates document after blob upload", async () => {
    const id = await createTravelDocument({
      tripId,
      metadata: {
        title: "Ticket",
        category: "flight",
      },
      fileBytes: Buffer.from("%PDF-1"),
      contentType: "application/pdf",
      sizeBytes: 6,
      originalFilename: "ticket.pdf",
    });

    expect(uploadTravelDocumentBlobMock).toHaveBeenCalled();
    expect(travelDocumentCreateMock).toHaveBeenCalled();
    expect(id).toBe(documentId);
  });

  it("rolls back blob when db create fails", async () => {
    travelDocumentCreateMock.mockRejectedValue(new Error("db fail"));

    await expect(
      createTravelDocument({
        tripId,
        metadata: { title: "Ticket", category: "flight" },
        fileBytes: Buffer.from("%PDF-1"),
        contentType: "application/pdf",
        sizeBytes: 6,
      }),
    ).rejects.toThrow("db fail");

    expect(deleteTravelDocumentBlobMock).toHaveBeenCalledWith(
      "trips/trip/documents/doc/file",
    );
  });

  it("rejects multiple context links", async () => {
    await expect(
      createTravelDocument({
        tripId,
        metadata: {
          title: "Ticket",
          category: "ticket",
          activityId,
          transportId,
        },
        fileBytes: Buffer.from("%PDF-1"),
        contentType: "application/pdf",
        sizeBytes: 6,
      }),
    ).rejects.toBeInstanceOf(TravelDocumentValidationError);

    expect(uploadTravelDocumentBlobMock).not.toHaveBeenCalled();
  });

  it("accepts transport link when transport belongs to trip", async () => {
    const id = await createTravelDocument({
      tripId,
      metadata: {
        title: "Train ticket",
        category: "train",
        transportId,
      },
      fileBytes: Buffer.from("%PDF-1"),
      contentType: "application/pdf",
      sizeBytes: 6,
    });

    expect(id).toBe(documentId);
    expect(transportFindOneMock).toHaveBeenCalled();
  });

  it("rejects cross-trip activity link", async () => {
    activityFindOneMock.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });

    await expect(
      createTravelDocument({
        tripId,
        metadata: {
          title: "Ticket",
          category: "ticket",
          activityId: otherTripActivityId,
        },
        fileBytes: Buffer.from("%PDF-1"),
        contentType: "application/pdf",
        sizeBytes: 6,
      }),
    ).rejects.toBeInstanceOf(TravelDocumentValidationError);

    expect(uploadTravelDocumentBlobMock).not.toHaveBeenCalled();
  });

  it("updates metadata without touching blob storage", async () => {
    await updateTravelDocumentMetadata({
      tripId,
      documentId,
      metadata: {
        title: "Updated",
        category: "insurance",
      },
    });

    expect(travelDocumentFindOneAndUpdateMock).toHaveBeenCalled();
    expect(uploadTravelDocumentBlobMock).not.toHaveBeenCalled();
    expect(deleteTravelDocumentBlobMock).not.toHaveBeenCalled();
  });

  it("rolls back new blob when replace db update fails", async () => {
    travelDocumentFindOneAndUpdateMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    await expect(
      replaceTravelDocumentFile({
        tripId,
        documentId,
        fileBytes: Buffer.from("%PDF-1"),
        contentType: "application/pdf",
        sizeBytes: 6,
      }),
    ).rejects.toBeInstanceOf(TravelDocumentNotFoundError);

    expect(deleteTravelDocumentBlobMock).toHaveBeenCalled();
  });

  it("deletes old blob after successful replace", async () => {
    await replaceTravelDocumentFile({
      tripId,
      documentId,
      fileBytes: Buffer.from("%PDF-1"),
      contentType: "application/pdf",
      sizeBytes: 6,
    });

    expect(deleteTravelDocumentBlobMock).toHaveBeenCalledWith("old-path");
  });

  it("deletes db record then attempts blob cleanup", async () => {
    await deleteTravelDocument({ tripId, documentId });

    expect(travelDocumentFindOneAndDeleteMock).toHaveBeenCalled();
    expect(deleteTravelDocumentBlobMock).toHaveBeenCalledWith("deleted-path");
  });

  it("keeps db deleted when blob cleanup fails", async () => {
    deleteTravelDocumentBlobMock.mockRejectedValue(new Error("blob fail"));

    await expect(deleteTravelDocument({ tripId, documentId })).resolves.toBeUndefined();
    expect(travelDocumentFindOneAndDeleteMock).toHaveBeenCalled();
  });
});
