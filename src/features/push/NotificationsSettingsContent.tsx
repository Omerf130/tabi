import { getTranslations } from "next-intl/server";
import { requireUser } from "@/features/auth/session";
import { AccountShell } from "@/features/account/AccountShell";
import { sanitizeProfileReturnTo } from "@/features/account/profile-return-to";
import { NotificationsSettingsClient } from "./NotificationsSettings.client";

type NotificationsSettingsContentProps = {
  returnTo: unknown;
};

export async function NotificationsSettingsContent({
  returnTo,
}: NotificationsSettingsContentProps) {
  await requireUser();
  const t = await getTranslations("AccountNotifications");
  const tCommon = await getTranslations("Common");
  const backHref = sanitizeProfileReturnTo(returnTo);

  return (
    <AccountShell
      title={t("title")}
      backHref={backHref}
      backLabel={tCommon("back")}
    >
      <NotificationsSettingsClient />
    </AccountShell>
  );
}
