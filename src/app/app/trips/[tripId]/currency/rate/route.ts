import { NextResponse } from "next/server";
import { isSupportedCurrencyCode } from "@/features/currency/currency-metadata";
import { getExchangeRate, getSupportedCurrencies } from "@/features/currency/queries";
import { currencyPairQuerySchema } from "@/features/currency/schemas";
import { FrankfurterRequestError } from "@/features/currency/frankfurter.server";
import { requireTripMember } from "@/features/trips/authorization";

export async function GET(
  request: Request,
  context: { params: Promise<{ tripId: string }> },
): Promise<Response> {
  const { tripId } = await context.params;
  await requireTripMember(tripId);

  const url = new URL(request.url);
  const parsed = currencyPairQuerySchema.safeParse({
    from: url.searchParams.get("from") ?? "",
    to: url.searchParams.get("to") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid currency pair" }, { status: 400 });
  }

  const currencies = await getSupportedCurrencies();
  const { from, to } = parsed.data;

  if (
    !isSupportedCurrencyCode(currencies, from) ||
    !isSupportedCurrencyCode(currencies, to)
  ) {
    return NextResponse.json({ error: "Unsupported currency" }, { status: 400 });
  }

  try {
    const rate = await getExchangeRate(from, to);
    return NextResponse.json(rate);
  } catch (error) {
    if (error instanceof FrankfurterRequestError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    throw error;
  }
}
