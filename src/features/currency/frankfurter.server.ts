import "server-only";

import {
  FRANKFURTER_API_BASE,
  FRANKFURTER_REVALIDATE_SECONDS,
} from "./constants";
import type { ExchangeRate } from "./types";

export class FrankfurterRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FrankfurterRequestError";
  }
}

export type FrankfurterCurrencyRecord = {
  iso_code: string;
  iso_numeric?: string;
  name: string;
  symbol?: string;
  start_date?: string;
  end_date?: string;
};

type FrankfurterRateResponse = {
  date?: string;
  base?: string;
  quote?: string;
  rate?: number;
};

type FrankfurterErrorResponse = {
  message?: string;
};

async function parseFrankfurterError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as FrankfurterErrorResponse;
    return payload.message?.trim() || "Frankfurter request failed";
  } catch {
    return "Frankfurter request failed";
  }
}

export async function fetchFrankfurterCurrencies(): Promise<
  FrankfurterCurrencyRecord[]
> {
  const response = await fetch(`${FRANKFURTER_API_BASE}/v2/currencies`, {
    next: { revalidate: FRANKFURTER_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new FrankfurterRequestError(await parseFrankfurterError(response));
  }

  return (await response.json()) as FrankfurterCurrencyRecord[];
}

export async function fetchFrankfurterRate(
  from: string,
  to: string,
): Promise<ExchangeRate> {
  const response = await fetch(
    `${FRANKFURTER_API_BASE}/v2/rate/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,
    {
      next: { revalidate: FRANKFURTER_REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) {
    throw new FrankfurterRequestError(await parseFrankfurterError(response));
  }

  const payload = (await response.json()) as FrankfurterRateResponse;
  if (
    !payload.date ||
    !payload.base ||
    !payload.quote ||
    typeof payload.rate !== "number"
  ) {
    throw new FrankfurterRequestError("Invalid Frankfurter rate response");
  }

  return {
    from: payload.base,
    to: payload.quote,
    rate: payload.rate,
    date: payload.date,
  };
}
