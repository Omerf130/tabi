import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  PhraseFavoriteValidationError,
  listFavoritePhraseIds,
  togglePhraseFavorite,
} from "./phrase-favorite-domain";
import { DEFAULT_PHRASEBOOK_PACK_ID } from "./constants";

const userId = "507f1f77bcf86cd799439011";

const {
  connectDbMock,
  phraseFavoriteFindMock,
  phraseFavoriteFindOneMock,
  phraseFavoriteCreateMock,
  phraseFavoriteDeleteOneMock,
} = vi.hoisted(() => ({
  connectDbMock: vi.fn(),
  phraseFavoriteFindMock: vi.fn(),
  phraseFavoriteFindOneMock: vi.fn(),
  phraseFavoriteCreateMock: vi.fn(),
  phraseFavoriteDeleteOneMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: connectDbMock,
}));

vi.mock("@/models/PhraseFavorite", () => ({
  PhraseFavorite: {
    find: phraseFavoriteFindMock,
    findOne: phraseFavoriteFindOneMock,
    create: phraseFavoriteCreateMock,
    deleteOne: phraseFavoriteDeleteOneMock,
  },
}));

describe("phrase favorite domain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectDbMock.mockResolvedValue(undefined);
    phraseFavoriteFindMock.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([{ phraseId: "basics.hello" }]),
      }),
    });
  });

  it("lists favorite phrase ids for a user and target language", async () => {
    const ids = await listFavoritePhraseIds(userId, "ja");

    expect(ids).toEqual(["basics.hello"]);
    expect(phraseFavoriteFindMock).toHaveBeenCalledWith({
      userId,
      targetLanguage: "ja",
    });
  });

  it("creates a favorite when none exists", async () => {
    phraseFavoriteFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });
    phraseFavoriteCreateMock.mockResolvedValue(undefined);

    const result = await togglePhraseFavorite({
      userId,
      packId: DEFAULT_PHRASEBOOK_PACK_ID,
      phraseId: "basics.thank-you",
    });

    expect(result).toEqual({ isFavorite: true });
    expect(phraseFavoriteCreateMock).toHaveBeenCalledWith({
      userId,
      targetLanguage: "ja",
      phraseId: "basics.thank-you",
    });
  });

  it("removes an existing favorite", async () => {
    phraseFavoriteFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: "favorite-1" }),
    });
    phraseFavoriteDeleteOneMock.mockResolvedValue(undefined);

    const result = await togglePhraseFavorite({
      userId,
      packId: DEFAULT_PHRASEBOOK_PACK_ID,
      phraseId: "basics.thank-you",
    });

    expect(result).toEqual({ isFavorite: false });
    expect(phraseFavoriteDeleteOneMock).toHaveBeenCalledWith({ _id: "favorite-1" });
  });

  it("rejects unknown phrase ids and pack ids", async () => {
    await expect(
      togglePhraseFavorite({
        userId,
        packId: DEFAULT_PHRASEBOOK_PACK_ID,
        phraseId: "unknown.phrase",
      }),
    ).rejects.toBeInstanceOf(PhraseFavoriteValidationError);

    await expect(
      togglePhraseFavorite({
        userId,
        packId: "he-it",
        phraseId: "basics.hello",
      }),
    ).rejects.toBeInstanceOf(PhraseFavoriteValidationError);
  });
});
