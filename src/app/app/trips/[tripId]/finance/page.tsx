import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AppPage } from "@/features/app-shell/AppPage";
import { FinancePageContent } from "@/features/finance/FinancePageContent";
import { prepareFinancePage } from "@/features/finance/queries";
import { requireTripMember } from "@/features/trips/authorization";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Finance"),
  ]);
  return { title: `${t("pageTitle")} · ${trip.name}` };
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