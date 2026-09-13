import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Currency"),
  ]);
  return { title: `${t("pageTitle")} · ${trip.name}` };
}

export default async function TripCurrencyPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Currency"),
  ]);
  const initialData = await prepareCurrencyConverterPage(trip.id);

  return (
    <>
      <TripHeader
        title={t("pageTitle")}
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
