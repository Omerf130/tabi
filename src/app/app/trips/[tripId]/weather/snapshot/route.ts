import { NextResponse } from "next/server";
import { getWeatherSnapshot } from "@/features/weather/queries";
import { weatherSnapshotQuerySchema } from "@/features/weather/schemas";
import { WeatherApiRequestError } from "@/features/weather/weatherapi.server";
import { requireTripMember } from "@/features/trips/authorization";

export async function GET(
  request: Request,
  context: { params: Promise<{ tripId: string }> },
): Promise<Response> {
  const { tripId } = await context.params;
  await requireTripMember(tripId);

  const url = new URL(request.url);
  const parsed = weatherSnapshotQuerySchema.safeParse({
    latitude: url.searchParams.get("latitude") ?? "",
    longitude: url.searchParams.get("longitude") ?? "",
    label: url.searchParams.get("label") ?? undefined,
    region: url.searchParams.get("region") ?? undefined,
    country: url.searchParams.get("country") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  try {
    const snapshot = await getWeatherSnapshot({
      label: parsed.data.label ?? "Selected location",
      region: parsed.data.region,
      country: parsed.data.country ?? "Unknown",
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
    });

    return NextResponse.json(snapshot);
  } catch (error) {
    if (error instanceof WeatherApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    throw error;
  }
}
