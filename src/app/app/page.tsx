import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MyTripsScreen } from "@/features/my-trips/MyTripsScreen";
import { listMyTripsCardsForUser } from "@/features/my-trips/queries";
import { requireUser } from "@/features/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MyTrips");

  return {
    title: t("metadataTitle"),
  };
}

export default async function AppHomePage() {
  const user = await requireUser();
  const trips = await listMyTripsCardsForUser(user.id);

  return <MyTripsScreen user={user} trips={trips} />;
}
