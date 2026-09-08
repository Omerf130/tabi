import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/app/trips/[tripId]/documents/[documentId]/file/route";

const {
  requireTripMemberMock,
  getTravelDocumentPathnameMock,
  readTravelDocumentBlobMock,
} = vi.hoisted(() => ({
  requireTripMemberMock: vi.fn(),
  getTravelDocumentPathnameMock: vi.fn(),
  readTravelDocumentBlobMock: vi.fn(),
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripMember: requireTripMemberMock,
}));

vi.mock("@/features/documents/document-domain", () => ({
  getTravelDocumentPathname: getTravelDocumentPathnameMock,
}));

vi.mock("@/features/documents/blob-storage", () => ({
  readTravelDocumentBlob: readTravelDocumentBlobMock,
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("not found");
  }),
}));

const tripId = "507f1f77bcf86cd799439011";
const documentId = "507f1f77bcf86cd799439012";

describe("travel document file route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTripMemberMock.mockResolvedValue({ id: tripId, role: "member" });
    getTravelDocumentPathnameMock.mockResolvedValue({
      pathname: "trips/trip/documents/doc",
      contentType: "application/pdf",
      originalFilename: "ticket.pdf",
    });
    readTravelDocumentBlobMock.mockResolvedValue({
      stream: new ReadableStream(),
      contentType: "application/pdf",
    });
  });

  it("allows trip member access with no-store and nosniff headers", async () => {
    const response = await GET(
      new Request(`http://localhost/app/trips/${tripId}/documents/${documentId}/file`),
      { params: Promise.resolve({ tripId, documentId }) },
    );

    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toBe(
      'inline; filename="ticket.pdf"',
    );
  });

  it("uses attachment disposition when download requested", async () => {
    const response = await GET(
      new Request(
        `http://localhost/app/trips/${tripId}/documents/${documentId}/file?download=1`,
      ),
      { params: Promise.resolve({ tripId, documentId }) },
    );

    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="ticket.pdf"',
    );
  });

  it("blocks access when document is outside trip scope", async () => {
    getTravelDocumentPathnameMock.mockResolvedValue(null);

    await expect(
      GET(
        new Request(`http://localhost/app/trips/${tripId}/documents/${documentId}/file`),
        { params: Promise.resolve({ tripId, documentId }) },
      ),
    ).rejects.toThrow("not found");
  });

  it("blocks invalid ids", async () => {
    await expect(
      GET(
        new Request("http://localhost/app/trips/bad/documents/bad/file"),
        { params: Promise.resolve({ tripId: "bad", documentId: "bad" }) },
      ),
    ).rejects.toThrow("not found");
  });
});
