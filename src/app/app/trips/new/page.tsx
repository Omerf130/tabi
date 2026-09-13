import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreateTripWizard } from "@/features/create-trip/CreateTripWizard";
import { requireUser } from "@/features/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CreateTrip");

  return {
    title: t("metadataTitle"),
  };
}

export default async function NewTripPage() {
  await requireUser();
  return <CreateTripWizard />;
}
