import { beforeEach, describe, expect, it, vi } from "vitest";
import { togglePhraseFavoriteAction } from "./actions";
import { DEFAULT_PHRASEBOOK_PACK_ID } from "./constants";

const tripId = "507f1f77bcf86cd799439011";

const {
  requireUserMock,
  requireTripMemberMock,
  togglePhraseFavoriteMock,
} = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
  requireTripMemberMock: vi.fn(),
  togglePhraseFavoriteMock: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripMember: requireTripMemberMock,
}));

vi.mock("./phrase-favorite-domain", () => ({
  togglePhraseFavorite: togglePhraseFavoriteMock,
  PhraseFavoriteValidationError: class PhraseFavoriteValidationError extends Error {},
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("togglePhraseFavoriteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-1" });
    requireTripMemberMock.mockResolvedValue({ id: tripId });
    togglePhraseFavoriteMock.mockResolvedValue({ isFavorite: true });
  });

  it("toggles a favorite for a trip member", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("phraseId", "basics.hello");
    formData.set("packId", DEFAULT_PHRASEBOOK_PACK_ID);

    const result = await togglePhraseFavoriteAction({}, formData);

    expect(result.ok).toBe(true);
    expect(result.isFavorite).toBe(true);
    expect(result.phraseId).toBe("basics.hello");
    expect(togglePhraseFavoriteMock).toHaveBeenCalledWith({
      userId: "user-1",
      packId: DEFAULT_PHRASEBOOK_PACK_ID,
      phraseId: "basics.hello",
    });
  });

  it("rejects invalid phrase ids", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("phraseId", "not-a-real-phrase");
    formData.set("packId", DEFAULT_PHRASEBOOK_PACK_ID);

    const result = await togglePhraseFavoriteAction({}, formData);

    expect(result.error).toBeDefined();
    expect(togglePhraseFavoriteMock).not.toHaveBeenCalled();
  });
});
