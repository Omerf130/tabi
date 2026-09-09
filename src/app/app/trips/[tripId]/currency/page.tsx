import type { Metadata } from "next";
import { AppPage } from "@/features/app-shell/AppPage";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { CurrencyConverter } from "@/features/currency/CurrencyConverter.client";
import { prepareCurrencyConverterPage } from "@/features/currency/queries";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `מטבע · ${trip.name}` };
}

export default async function TripCurrencyPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  const initialData = await prepareCurrencyConverterPage(trip.id);

  return (
    <>
      <TripHeader
        title="מטבע"
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/more`}
      />
      <AppPage width="content">
        <CurrencyConverter {...initialData} />
      </AppPage>
    </>
  );
}
