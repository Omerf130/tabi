import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPage } from "@/features/app-shell/AppPage";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { parseTransportTypeParam } from "@/features/transport/schemas";
import { createEmptyTransportFormValues } from "@/features/transport/transport-form-defaults";
import { TransportForm } from "@/features/transport/TransportForm.client";
import { TRANSPORT_TYPE_SINGULAR_LABELS } from "@/features/transport/transport-types";
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
  const trip = await requireTripOwner(tripId);
  const transportType = parseTransportTypeParam(type);
  const typeLabel = transportType ? TRANSPORT_TYPE_SINGULAR_LABELS[transportType] : "תחבורה";
  return { title: `הוספת ${typeLabel} · ${trip.name}` };
}

export default async function NewTransportPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { tripId } = await params;
  const { type } = await searchParams;
  const trip = await requireTripOwner(tripId);
  const transportType = parseTransportTypeParam(type);

  if (!transportType) {
    notFound();
  }

  const defaultValues = createEmptyTransportFormValues(transportType);

  return (
    <>
      <TripHeader
        title={`הוספת ${TRANSPORT_TYPE_SINGULAR_LABELS[transportType]}`}
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/transport`}
      />
      <AppPage width="content">
        <TransportForm tripId={trip.id} defaultValues={defaultValues} mode="create" />
      </AppPage>
    </>
  );
}
