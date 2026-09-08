import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadTripCoverAction, removeTripCoverAction } from "./actions";

const {
  requireTripOwnerMock,
  replaceTripCoverImageMock,
  removeTripCoverImageMock,
  cleanupTripCoverPathnameMock,
} = vi.hoisted(() => ({
  requireTripOwnerMock: vi.fn(),
  replaceTripCoverImageMock: vi.fn(),
  removeTripCoverImageMock: vi.fn(),
  cleanupTripCoverPathnameMock: vi.fn(),
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripOwner: requireTripOwnerMock,
}));

vi.mock("./cover-domain", () => ({
  replaceTripCoverImage: replaceTripCoverImageMock,
  removeTripCoverImage: removeTripCoverImageMock,
  cleanupTripCoverPathname: cleanupTripCoverPathnameMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

function jpegFile(size = 4): File {
  const bytes = new Uint8Array([0xff, 0xd8, 0xff, ...Array(Math.max(0, size - 3)).fill(0)]);
  return new File([bytes], "cover.jpg", { type: "image/jpeg" });
}

describe("uploadTripCoverAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTripOwnerMock.mockResolvedValue({ id: "trip-1", role: "owner" });
    replaceTripCoverImageMock.mockResolvedValue({
      cover: { pathname: "new", contentType: "image/jpeg" },
      previousPathname: null,
    });
  });

  it("allows owner upload", async () => {
    const formData = new FormData();
    formData.set("tripId", "507f1f77bcf86cd799439011");
    formData.set("cover", jpegFile());

    const result = await uploadTripCoverAction({}, formData);

    expect(result.ok).toBe(true);
    expect(requireTripOwnerMock).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
    expect(replaceTripCoverImageMock).toHaveBeenCalled();
  });

  it("rejects member upload via owner authorization", async () => {
    requireTripOwnerMock.mockRejectedValue(new Error("not found"));
    const formData = new FormData();
    formData.set("tripId", "507f1f77bcf86cd799439011");
    formData.set("cover", jpegFile());

    const result = await uploadTripCoverAction({}, formData);

    expect(result.ok).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(replaceTripCoverImageMock).not.toHaveBeenCalled();
  });

  it("rejects invalid file type", async () => {
    const bytes = new Uint8Array([0x00, 0x00, 0x00]);
    const file = new File([bytes], "cover.png", { type: "image/png" });
    const formData = new FormData();
    formData.set("tripId", "507f1f77bcf86cd799439011");
    formData.set("cover", file);

    const result = await uploadTripCoverAction({}, formData);

    expect(result.error).toBeDefined();
    expect(replaceTripCoverImageMock).not.toHaveBeenCalled();
  });

  it("rejects oversized file", async () => {
    const formData = new FormData();
    formData.set("tripId", "507f1f77bcf86cd799439011");
    formData.set("cover", jpegFile(6 * 1024 * 1024));

    const result = await uploadTripCoverAction({}, formData);

    expect(result.error).toBeDefined();
    expect(replaceTripCoverImageMock).not.toHaveBeenCalled();
  });

  it("cleans up previous blob after replacement", async () => {
    replaceTripCoverImageMock.mockResolvedValue({
      cover: { pathname: "new", contentType: "image/jpeg" },
      previousPathname: "old-path",
    });
    const formData = new FormData();
    formData.set("tripId", "507f1f77bcf86cd799439011");
    formData.set("cover", jpegFile());

    await uploadTripCoverAction({}, formData);

    expect(cleanupTripCoverPathnameMock).toHaveBeenCalledWith("old-path");
  });
});

describe("removeTripCoverAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTripOwnerMock.mockResolvedValue({ id: "trip-1", role: "owner" });
    removeTripCoverImageMock.mockResolvedValue("path");
  });

  it("allows owner removal", async () => {
    const formData = new FormData();
    formData.set("tripId", "507f1f77bcf86cd799439011");

    const result = await removeTripCoverAction({}, formData);

    expect(result.ok).toBe(true);
    expect(removeTripCoverImageMock).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
    );
  });

  it("rejects member removal via owner authorization", async () => {
    requireTripOwnerMock.mockRejectedValue(new Error("not found"));
    const formData = new FormData();
    formData.set("tripId", "507f1f77bcf86cd799439011");

    const result = await removeTripCoverAction({}, formData);

    expect(result.ok).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(removeTripCoverImageMock).not.toHaveBeenCalled();
  });
});
