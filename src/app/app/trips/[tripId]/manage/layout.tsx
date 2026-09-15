import { getTranslations } from "next-intl/server";
import { TripManageHeader } from "@/features/app-shell/TripManageHeader";
import { requireTripMember } from "@/features/trips/authorization";
import { AppPage } from "@/features/app-shell/AppPage";
import { TripManagementAccountFooter } from "@/features/trip-management/TripManagementAccountFooter";

export default async function TripManageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  const t = await getTranslations("Settings");

  return (
    <>
      <TripManageHeader
        title={t("title")}
        tripName={trip.name}
        tripId={tripId}
      />
      {children}
      <AppPage width="wide">
        <TripManagementAccountFooter />
      </AppPage>
    </>
  );
}
