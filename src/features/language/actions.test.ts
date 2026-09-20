import { beforeEach, describe, expect, it, vi } from "vitest";
import { togglePhraseFavoriteAction } from "./actions";

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
    requireTripMemberMock.mockResolvedValue({
      id: tripId,
      effectiveTravelLanguageCode: "ja",
    });
    togglePhraseFavoriteMock.mockResolvedValue({ isFavorite: true });
  });

  it("toggles a favorite using the trip effective travel language", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("phraseId", "basics.hello");

    const result = await togglePhraseFavoriteAction({}, formData);

    expect(result.ok).toBe(true);
    expect(result.isFavorite).toBe(true);
    expect(result.phraseId).toBe("basics.hello");
    expect(togglePhraseFavoriteMock).toHaveBeenCalledWith({
      userId: "user-1",
      targetLanguage: "ja",
      phraseId: "basics.hello",
    });
  });

  it("rejects invalid phrase ids", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("phraseId", "not-a-real-phrase");

    const result = await togglePhraseFavoriteAction({}, formData);

    expect(result.errorCode).toBeDefined();
    expect(togglePhraseFavoriteMock).not.toHaveBeenCalled();
  });

  it("rejects favorites when trip travel language is unknown", async () => {
    requireTripMemberMock.mockResolvedValue({
      id: tripId,
      effectiveTravelLanguageCode: null,
    });

    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("phraseId", "basics.hello");

    const result = await togglePhraseFavoriteAction({}, formData);
    expect(result.errorCode).toBeDefined();
    expect(togglePhraseFavoriteMock).not.toHaveBeenCalled();
  });
});
