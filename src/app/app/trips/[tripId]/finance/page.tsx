import type { Metadata } from "next";
import { AppPage } from "@/features/app-shell/AppPage";
import { FINANCE_PAGE_TITLE } from "@/features/finance/constants";
import { FinancePageContent } from "@/features/finance/FinancePageContent";
import { prepareFinancePage } from "@/features/finance/queries";
import { requireTripMember } from "@/features/trips/authorization";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `${FINANCE_PAGE_TITLE} · ${trip.name}` };
}

export default async function TripFinancePage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  const pageData = await prepareFinancePage({
    trip: {
      id: trip.id,
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      coverImage: trip.coverImage,
      coverVisualKey: trip.coverVisualKey,
    },
    isOwner: trip.role === "owner",
  });

  return (
    <AppPage width="wide">
      <FinancePageContent {...pageData} />
    </AppPage>
  );
}