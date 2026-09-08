import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { listTripsForUser } from "@/features/trips/queries";

export default async function AppHomePage() {
  const user = await requireUser();
  const trips = await listTripsForUser(user.id);

  if (trips.length === 0) {
    redirect("/app/trips/new");
  }

  if (trips.length === 1) {
    redirect(`/app/trips/${trips[0].id}`);
  }

  redirect("/app/trips");
}
