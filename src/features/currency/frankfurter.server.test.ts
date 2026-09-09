import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchFrankfurterCurrencies,
  fetchFrankfurterRate,
  FrankfurterRequestError,
} from "./frankfurter.server";

const fetchMock = vi.fn();

describe("frankfurter.server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("fetches supported currencies with revalidation", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        { iso_code: "JPY", name: "Japanese Yen", symbol: "¥" },
      ],
    });

    const currencies = await fetchFrankfurterCurrencies();
    expect(currencies).toHaveLength(1);
    expect(fetchMock.mock.calls[0]?.[1]).toEqual({
      next: { revalidate: 86_400 },
    });
  });

  it("fetches exchange rates with provider date", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        date: "2026-09-09",
        base: "JPY",
        quote: "ILS",
        rate: 0.0196,
      }),
    });

    const rate = await fetchFrankfurterRate("JPY", "ILS");
    expect(rate).toEqual({
      from: "JPY",
      to: "ILS",
      rate: 0.0196,
      date: "2026-09-09",
    });
  });

  it("throws on provider failures", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Unsupported currency" }),
    });

    await expect(fetchFrankfurterRate("XXX", "ILS")).rejects.toBeInstanceOf(
      FrankfurterRequestError,
    );
  });
});
