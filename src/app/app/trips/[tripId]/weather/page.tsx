import type { Metadata } from "next";
import { AppPage } from "@/features/app-shell/AppPage";
import { TripHeader } from "@/features/app-shell/TripHeader";
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
  const trip = await requireTripMember(tripId);
  const initialData = await prepareWeatherPage(trip.id);

  return (
    <>
      <TripHeader
        title="מזג אוויר"
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/more`}
      />
      <AppPage width="content">
        <WeatherPage {...initialData} />
      </AppPage>
    </>
  );
}
