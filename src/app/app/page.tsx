import type { Metadata } from "next";
import { MyTripsScreen } from "@/features/my-trips/MyTripsScreen";
import { listMyTripsCardsForUser } from "@/features/my-trips/queries";
import { requireUser } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "My Trips · Tabi",
};

export default async function AppHomePage() {
  const user = await requireUser();
  const trips = await listMyTripsCardsForUser(user.id);

  return <MyTripsScreen user={user} trips={trips} />;
}
