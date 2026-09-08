import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTravelDocumentAction,
  deleteTravelDocumentAction,
  replaceTravelDocumentFileAction,
  updateTravelDocumentAction,
} from "./actions";

const {
  requireTripOwnerMock,
  createTravelDocumentMock,
  updateTravelDocumentMetadataMock,
  replaceTravelDocumentFileMock,
  deleteTravelDocumentMock,
} = vi.hoisted(() => ({
  requireTripOwnerMock: vi.fn(),
  createTravelDocumentMock: vi.fn(),
  updateTravelDocumentMetadataMock: vi.fn(),
  replaceTravelDocumentFileMock: vi.fn(),
  deleteTravelDocumentMock: vi.fn(),
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripOwner: requireTripOwnerMock,
}));

vi.mock("./document-domain", () => ({
  createTravelDocument: createTravelDocumentMock,
  updateTravelDocumentMetadata: updateTravelDocumentMetadataMock,
  replaceTravelDocumentFile: replaceTravelDocumentFileMock,
  deleteTravelDocument: deleteTravelDocumentMock,
  TravelDocumentValidationError: class TravelDocumentValidationError extends Error {},
  TravelDocumentNotFoundError: class TravelDocumentNotFoundError extends Error {
    constructor() {
      super("not found");
    }
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const tripId = "507f1f77bcf86cd799439011";
const documentId = "507f1f77bcf86cd799439012";
const activityId = "507f1f77bcf86cd799439013";

function pdfFile(size = 8): File {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, ...Array(Math.max(0, size - 4)).fill(0)]);
  return new File([bytes], "ticket.pdf", { type: "application/pdf" });
}

describe("travel document actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTripOwnerMock.mockResolvedValue({ id: tripId, role: "owner" });
    createTravelDocumentMock.mockResolvedValue(documentId);
    updateTravelDocumentMetadataMock.mockResolvedValue(undefined);
    replaceTravelDocumentFileMock.mockResolvedValue(undefined);
    deleteTravelDocumentMock.mockResolvedValue(undefined);
  });

  it("creates document for owner", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("title", "Flight ticket");
    formData.set("category", "flight");
    formData.set("file", pdfFile());
    formData.set("linkType", "none");

    const result = await createTravelDocumentAction({}, formData);

    expect(result.ok).toBe(true);
    expect(createTravelDocumentMock).toHaveBeenCalled();
  });

  it("rejects member mutations via owner authorization", async () => {
    requireTripOwnerMock.mockRejectedValue(new Error("forbidden"));
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("title", "Doc");
    formData.set("category", "other");
    formData.set("file", pdfFile());

    const result = await createTravelDocumentAction({}, formData);

    expect(result.ok).toBeUndefined();
    expect(createTravelDocumentMock).not.toHaveBeenCalled();
  });

  it("updates metadata without requiring file", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("documentId", documentId);
    formData.set("title", "Updated title");
    formData.set("category", "ticket");
    formData.set("linkType", "activity");
    formData.set("activityId", activityId);

    const result = await updateTravelDocumentAction({}, formData);

    expect(result.ok).toBe(true);
    expect(updateTravelDocumentMetadataMock).toHaveBeenCalled();
    expect(replaceTravelDocumentFileMock).not.toHaveBeenCalled();
  });

  it("replaces file through dedicated action", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("documentId", documentId);
    formData.set("file", pdfFile());

    const result = await replaceTravelDocumentFileAction({}, formData);

    expect(result.ok).toBe(true);
    expect(replaceTravelDocumentFileMock).toHaveBeenCalled();
  });

  it("deletes document for owner", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("documentId", documentId);

    const result = await deleteTravelDocumentAction({}, formData);

    expect(result.ok).toBe(true);
    expect(deleteTravelDocumentMock).toHaveBeenCalled();
  });

  it("rejects invalid file on create", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("title", "Bad");
    formData.set("category", "other");
    formData.set(
      "file",
      new File([new Uint8Array([0, 0, 0])], "bad.pdf", {
        type: "application/pdf",
      }),
    );

    const result = await createTravelDocumentAction({}, formData);

    expect(result.error).toBeDefined();
    expect(createTravelDocumentMock).not.toHaveBeenCalled();
  });
});
