import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  removeUserProfileImageAction,
  uploadUserProfileImageAction,
} from "./profile-image-actions";

const userId = "507f1f77bcf86cd799439011";

const {
  requireUserMock,
  replaceUserProfileImageMock,
  clearUserProfileImageMock,
  cleanupProfileImagePathnameMock,
} = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
  replaceUserProfileImageMock: vi.fn(),
  clearUserProfileImageMock: vi.fn(),
  cleanupProfileImagePathnameMock: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/features/account/profile-image/profile-image-domain", () => ({
  replaceUserProfileImage: replaceUserProfileImageMock,
  clearUserProfileImage: clearUserProfileImageMock,
  cleanupProfileImagePathname: cleanupProfileImagePathnameMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

function jpegFile(size = 4): File {
  const bytes = new Uint8Array([
    0xff, 0xd8, 0xff, ...Array(Math.max(0, size - 3)).fill(0),
  ]);
  return new File([bytes], "profile.jpg", { type: "image/jpeg" });
}

describe("uploadUserProfileImageAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: userId });
    replaceUserProfileImageMock.mockResolvedValue({
      image: { pathname: "new", url: "u", contentType: "image/jpeg" },
      previousPathname: null,
    });
  });

  it("uploads for the session user only", async () => {
    const formData = new FormData();
    formData.set("profileImage", jpegFile());
    const result = await uploadUserProfileImageAction({}, formData);
    expect(result.ok).toBe(true);
    expect(replaceUserProfileImageMock).toHaveBeenCalledWith(
      userId,
      expect.any(Buffer),
      "image/jpeg",
    );
  });

  it("rejects invalid type", async () => {
    const bytes = new Uint8Array([0x00, 0x00, 0x00]);
    const file = new File([bytes], "profile.png", { type: "image/png" });
    const formData = new FormData();
    formData.set("profileImage", file);
    const result = await uploadUserProfileImageAction({}, formData);
    expect(result.errorCode).toBe("invalidType");
    expect(replaceUserProfileImageMock).not.toHaveBeenCalled();
  });

  it("rejects oversized files", async () => {
    const formData = new FormData();
    formData.set("profileImage", jpegFile(6 * 1024 * 1024));
    const result = await uploadUserProfileImageAction({}, formData);
    expect(result.errorCode).toBe("tooLarge");
  });

  it("cleans up previous blob after replacement", async () => {
    replaceUserProfileImageMock.mockResolvedValue({
      image: { pathname: "new", url: "u", contentType: "image/jpeg" },
      previousPathname: "old-path",
    });
    const formData = new FormData();
    formData.set("profileImage", jpegFile());
    await uploadUserProfileImageAction({}, formData);
    expect(cleanupProfileImagePathnameMock).toHaveBeenCalledWith("old-path");
  });
});

describe("removeUserProfileImageAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: userId });
    clearUserProfileImageMock.mockResolvedValue("stored-path");
  });

  it("clears stored image for session user", async () => {
    const result = await removeUserProfileImageAction({}, new FormData());
    expect(result.ok).toBe(true);
    expect(clearUserProfileImageMock).toHaveBeenCalledWith(userId);
    expect(cleanupProfileImagePathnameMock).toHaveBeenCalledWith("stored-path");
  });

  it("does not accept pathname from client", async () => {
    const formData = new FormData();
    formData.set("pathname", "users/other/profile");
    await removeUserProfileImageAction({}, formData);
    expect(clearUserProfileImageMock).toHaveBeenCalledWith(userId);
  });
});
