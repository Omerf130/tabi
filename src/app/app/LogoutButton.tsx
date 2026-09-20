"use client";

import { useTranslations } from "next-intl";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import { LogoutWithPushCleanup } from "@/features/push/LogoutWithPushCleanup.client";

export function LogoutButton() {
  const t = useTranslations("AccountMenu");

  return (
    <LogoutWithPushCleanup>
      <AuthSubmitButton>{t("logout")}</AuthSubmitButton>
    </LogoutWithPushCleanup>
  );
}
