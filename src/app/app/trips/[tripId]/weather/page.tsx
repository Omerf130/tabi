import type { Metadata } from "next";
import { AppPage } from "@/features/app-shell/AppPage";
import { WeatherPage } from "@/features/weather/WeatherPage.client";
import { prepareWeatherPage } from "@/features/weather/queries";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `מזג אוויר · ${trip.name}` };
}

export default async function TripWeatherPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  await requireTripMember(tripId);
  const initialData = await prepareWeatherPage(tripId);

  return (
    <AppPage width="content" density="compact">
      <WeatherPage
        {...initialData}
        backHref={`/app/trips/${tripId}/more`}
      />
    </AppPage>
  );
}
