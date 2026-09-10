import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPage } from "@/features/app-shell/AppPage";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { getTransportForTrip } from "@/features/transport/queries";
import {
  createEmptyTransportFormValues,
  toTransportFormValues,
} from "@/features/transport/transport-form-defaults";
import { TransportForm } from "@/features/transport/TransportForm.client";
import { TRANSPORT_TYPE_SINGULAR_LABELS } from "@/features/transport/transport-types";
import { prepareEntityCostFormContext } from "@/features/finance/linked-expense-queries";
import { requireTripOwner } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string; transportId: string }>;
}): Promise<Metadata> {
  const { tripId, transportId } = await params;
  const trip = await requireTripOwner(tripId);
  const transport = await getTransportForTrip(trip.id, transportId);
  const typeLabel = transport
    ? TRANSPORT_TYPE_SINGULAR_LABELS[transport.type]
    : "תחבורה";
  return { title: `עריכת ${typeLabel} · ${trip.name}` };
}

export default async function EditTransportPage({
  params,
}: {
  params: Promise<{ tripId: string; transportId: string }>;
}) {
  const { tripId, transportId } = await params;
  const trip = await requireTripOwner(tripId);
  const transport = await getTransportForTrip(trip.id, transportId);

  if (!transport) {
    notFound();
  }

  const defaultValues = transport
    ? toTransportFormValues(transport)
    : createEmptyTransportFormValues("flight");
  const financeContext = await prepareEntityCostFormContext(trip.id);

  return (
    <>
      <TripHeader
        title={`עריכת ${TRANSPORT_TYPE_SINGULAR_LABELS[transport.type]}`}
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/transport/${transportId}`}
      />
      <AppPage width="content">
        <TransportForm
          tripId={trip.id}
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
