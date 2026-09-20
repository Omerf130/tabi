import { beforeEach, describe, expect, it, vi } from "vitest";

const tripId = "507f1f77bcf86cd799439011";
const userId = "507f1f77bcf86cd799439012";

const {
  getCurrentUserMock,
  requireTripMemberMock,
  resolveRequestLocaleMock,
  translateCustomPhraseMock,
  checkRateLimitMock,
} = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  requireTripMemberMock: vi.fn(),
  resolveRequestLocaleMock: vi.fn(),
  translateCustomPhraseMock: vi.fn(),
  checkRateLimitMock: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({
  getCurrentUser: getCurrentUserMock,
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripMember: requireTripMemberMock,
}));

vi.mock("@/features/i18n/resolve-request-locale", () => ({
  resolveRequestLocale: resolveRequestLocaleMock,
}));

vi.mock("@/features/language/translation/translate-custom-phrase.server", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("@/features/language/translation/translate-custom-phrase.server")
  >();
  return {
    ...actual,
    translateCustomPhrase: translateCustomPhraseMock,
  };
});

vi.mock("@/features/language/translation/custom-translation-rate-limit", () => ({
  checkCustomTranslationRateLimit: checkRateLimitMock,
}));

import { POST } from "./route";

describe("POST /app/trips/[tripId]/language/translate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue({ id: userId });
    requireTripMemberMock.mockResolvedValue({
      id: tripId,
      effectiveTravelLanguageCode: "it",
    });
    resolveRequestLocaleMock.mockResolvedValue("he");
    checkRateLimitMock.mockReturnValue(true);
    translateCustomPhraseMock.mockResolvedValue({
      translatedText: "Ciao",
      transliterationLatin: null,
      targetLanguage: "it",
    });
  });

  function post(body: Record<string, unknown>) {
    return POST(
      new Request(`http://localhost/app/trips/${tripId}/language/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      { params: Promise.resolve({ tripId }) },
    );
  }

  it("rejects unauthenticated requests", async () => {
    getCurrentUserMock.mockResolvedValue(null);
    const response = await post({ tripId, text: "שלום" });
    expect(response.status).toBe(401);
    expect(translateCustomPhraseMock).not.toHaveBeenCalled();
  });

  it("rejects non-members", async () => {
    requireTripMemberMock.mockRejectedValue(new Error("forbidden"));
    const response = await post({ tripId, text: "שלום" });
    expect(response.status).toBe(403);
  });

  it("resolves target language from trip workspace", async () => {
    await post({ tripId, text: "שלום" });
    expect(translateCustomPhraseMock).toHaveBeenCalledWith(
      expect.objectContaining({
        targetTravelLanguageCode: "it",
        uiLocale: "he",
      }),
    );
  });

  it("rejects empty input", async () => {
    const response = await post({ tripId, text: "   " });
    expect(response.status).toBe(400);
    expect(translateCustomPhraseMock).not.toHaveBeenCalled();
  });

  it("rejects oversized input", async () => {
    const response = await post({ tripId, text: "a".repeat(501) });
    expect(response.status).toBe(400);
  });

  it("does not call Azure when trip language is unknown", async () => {
    requireTripMemberMock.mockResolvedValue({
      id: tripId,
      effectiveTravelLanguageCode: null,
    });
    const response = await post({ tripId, text: "Hello" });
    expect(response.status).toBe(422);
    expect(translateCustomPhraseMock).not.toHaveBeenCalled();
  });

  it("enforces rate limiting", async () => {
    checkRateLimitMock.mockReturnValue(false);
    const response = await post({ tripId, text: "Hello" });
    expect(response.status).toBe(429);
    expect(translateCustomPhraseMock).not.toHaveBeenCalled();
  });

  it("maps provider failures safely without exposing keys", async () => {
    const { CustomTranslationUnavailableError } = await import(
      "@/features/language/translation/translate-custom-phrase.server"
    );
    translateCustomPhraseMock.mockRejectedValue(new CustomTranslationUnavailableError("x"));

    const response = await post({ tripId, text: "Hello" });
    const body = (await response.json()) as Record<string, string>;
    expect(response.status).toBe(503);
    expect(body.error).toBe("unavailable");
    expect(JSON.stringify(body)).not.toContain("subscription");
    expect(JSON.stringify(body)).not.toContain("Ocp-Apim");
  });

  it("rejects mismatched tripId in body", async () => {
    const response = await post({ tripId: "507f1f77bcf86cd799439099", text: "Hi" });
    expect(response.status).toBe(400);
  });
});
