import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AppPage } from "@/features/app-shell/AppPage";
import { TripHeader } from "@/features/app-shell/TripHeader";
import {
  buildItineraryDayHref,
  parseTransportFromDayParam,
} from "@/features/itinerary/routes";
import { parseTransportTypeParam } from "@/features/transport/schemas";
import { createEmptyTransportFormValues } from "@/features/transport/transport-form-defaults";
import { TransportForm } from "@/features/transport/TransportForm.client";
import { createTransportTypeSingularLabelResolver } from "@/features/transport/transport-types";
import { prepareEntityCostFormContext } from "@/features/finance/linked-expense-queries";
import { requireTripOwner } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ type?: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const { type } = await searchParams;
  const [trip, t] = await Promise.all([
    requireTripOwner(tripId),
    getTranslations("Transport"),
  ]);
  const transportType = parseTransportTypeParam(type);
  const typeLabel = transportType
    ? createTransportTypeSingularLabelResolver(t)(transportType)
    : t("genericType");
  return { title: `${t("addTitle", { type: typeLabel })} · ${trip.name}` };
}

export default async function NewTransportPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ type?: string; departureDate?: string; fromDay?: string }>;
}) {
  const { tripId } = await params;
  const { type, departureDate, fromDay } = await searchParams;
  const [trip, t] = await Promise.all([
    requireTripOwner(tripId),
    getTranslations("Transport"),
  ]);
  const transportType = parseTransportTypeParam(type);

  if (!transportType) {
    notFound();
  }

  const typeLabel = createTransportTypeSingularLabelResolver(t)(transportType);
  const defaultValues = createEmptyTransportFormValues(
    transportType,
    trip.destinationCalendarTimeZone,
  );
  const resolvedDepartureDate =
    departureDate &&
    parseTransportFromDayParam(departureDate, trip.startDate, trip.endDate);
  if (resolvedDepartureDate) {
    defaultValues.departureDate = resolvedDepartureDate;
    defaultValues.arrivalDate = resolvedDepartureDate;
  }

  const resolvedFromDay = parseTransportFromDayParam(
    fromDay,
    trip.startDate,
    trip.endDate,
  );
  const successHref = resolvedFromDay
    ? buildItineraryDayHref(tripId, resolvedFromDay)
    : undefined;
  const backHref = successHref ?? `/app/trips/${tripId}/transport`;
  const financeContext = await prepareEntityCostFormContext(trip.id);

  return (
    <>
      <TripHeader
        title={t("addTitle", { type: typeLabel })}
        tripName={trip.name}
        showTripSwitch
        backHref={backHref}
      />
      <AppPage width="content">
        <TransportForm
          tripId={trip.id}
          destinationCountryCode={trip.destination?.countryCode}
          defaultValues={defaultValues}
          mode="create"
          successHref={successHref}
          financeBaseCurrency={financeContext.baseCurrency}
          currencies={financeContext.currencies}
        />
      </AppPage>
    </>
  );
}
