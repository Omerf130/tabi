import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotificationsSettingsContent } from "@/features/push/NotificationsSettingsContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AccountNotifications");
  return { title: t("title") };
}

type NotificationsPageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function AccountNotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const params = await searchParams;
  return <NotificationsSettingsContent returnTo={params.returnTo} />;
}
