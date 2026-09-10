import type { Metadata } from "next";
import { CreateTripWizard } from "@/features/create-trip/CreateTripWizard";
import { requireUser } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "Create trip · Tabi",
};

export default async function NewTripPage() {
  await requireUser();
  return <CreateTripWizard />;
}
