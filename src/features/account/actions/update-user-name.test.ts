import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateUserNameAction } from "./update-user-name";

const userId = "507f1f77bcf86cd799439011";

const { requireUserMock, updateOneMock } = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
  updateOneMock: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/models/User", () => ({
  User: {
    updateOne: updateOneMock,
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("updateUserNameAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: userId, name: "Before" });
    updateOneMock.mockResolvedValue({});
  });

  it("updates the authenticated user name with trim", async () => {
    const formData = new FormData();
    formData.set("name", "  Dana Cohen  ");
    const result = await updateUserNameAction({}, formData);
    expect(result.ok).toBe(true);
    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: userId },
      { $set: { name: "Dana Cohen" } },
    );
  });

  it("rejects invalid names", async () => {
    const formData = new FormData();
    formData.set("name", "a");
    const result = await updateUserNameAction({}, formData);
    expect(result.errorCode).toBe("invalid_name");
    expect(updateOneMock).not.toHaveBeenCalled();
  });

  it("does not accept a client user id field", async () => {
    const formData = new FormData();
    formData.set("name", "Valid Name");
    formData.set("userId", "other-user");
    await updateUserNameAction({}, formData);
    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: userId },
      expect.any(Object),
    );
  });
});
