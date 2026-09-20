import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AppPage } from "@/features/app-shell/AppPage";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { getTransportForTrip } from "@/features/transport/queries";
import {
  createEmptyTransportFormValues,
  toTransportFormValues,
} from "@/features/transport/transport-form-defaults";
import { TransportForm } from "@/features/transport/TransportForm.client";
import { createTransportTypeSingularLabelResolver } from "@/features/transport/transport-types";
import { prepareEntityCostFormContext } from "@/features/finance/linked-expense-queries";
import { requireTripOwner } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string; transportId: string }>;
}): Promise<Metadata> {
  const { tripId, transportId } = await params;
  const [trip, t, transport] = await Promise.all([
    requireTripOwner(tripId),
    getTranslations("Transport"),
    getTransportForTrip(tripId, transportId),
  ]);
  const typeLabel = transport
    ? createTransportTypeSingularLabelResolver(t)(transport.type)
    : t("genericType");
  return { title: `${t("editTitle", { type: typeLabel })} · ${trip.name}` };
}

export default async function EditTransportPage({
  params,
}: {
  params: Promise<{ tripId: string; transportId: string }>;
}) {
  const { tripId, transportId } = await params;
  const [trip, t] = await Promise.all([
    requireTripOwner(tripId),
    getTranslations("Transport"),
  ]);
  const transport = await getTransportForTrip(trip.id, transportId);

  if (!transport) {
    notFound();
  }

  const typeLabel = createTransportTypeSingularLabelResolver(t)(transport.type);
  const defaultValues = toTransportFormValues(transport);
  const financeContext = await prepareEntityCostFormContext(trip.id);

  return (
    <>
      <TripHeader
        title={t("editTitle", { type: typeLabel })}
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/transport/${transportId}`}
      />
      <AppPage width="content">
        <TransportForm
          tripId={trip.id}
          destinationCountryCode={trip.destination?.countryCode}
          defaultValues={defaultValues}
          mode="edit"
          transportId={transport.id}
          financeBaseCurrency={financeContext.baseCurrency}
          currencies={financeContext.currencies}
          linkedCost={transport.linkedCost}
        />
      </AppPage>
    </>
  );
}
