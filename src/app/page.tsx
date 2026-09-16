import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/features/auth/session";
import { WelcomeScreen } from "@/features/welcome/WelcomeScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Welcome");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/app");
  }

  return <WelcomeScreen />;
}
