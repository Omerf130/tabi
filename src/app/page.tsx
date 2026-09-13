import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { WelcomeScreen } from "@/features/welcome/WelcomeScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Welcome");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default function HomePage() {
  return <WelcomeScreen />;
}
