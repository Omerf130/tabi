import { getTranslations } from "next-intl/server";
import { TripHeader } from "@/features/app-shell/TripHeader";
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
      <TripHeader
        title={t("title")}
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/more`}
      />
      {children}
      <AppPage width="wide">
        <TripManagementAccountFooter />
      </AppPage>
    </>
  );
}
