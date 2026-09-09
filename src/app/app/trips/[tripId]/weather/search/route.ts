import { NextResponse } from "next/server";
import { weatherSearchQuerySchema } from "@/features/weather/schemas";
import { searchWeatherLocationsWithFallback } from "@/features/weather/weather-search.server";
import { WeatherApiRequestError } from "@/features/weather/weatherapi.server";
import { requireTripMember } from "@/features/trips/authorization";

export async function GET(
  request: Request,
  context: { params: Promise<{ tripId: string }> },
): Promise<Response> {
  const { tripId } = await context.params;
  await requireTripMember(tripId);

  const url = new URL(request.url);
  const parsed = weatherSearchQuerySchema.safeParse({
    q: url.searchParams.get("q") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid search query" }, { status: 400 });
  }

  try {
    const results = await searchWeatherLocationsWithFallback(parsed.data.q);
    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof WeatherApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    throw error;
  }
}
