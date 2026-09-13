"use client";

import { useTranslations } from "next-intl";
import { logoutAction } from "@/features/auth/actions";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";

export function LogoutButton() {
  const t = useTranslations("AccountMenu");

  return (
    <form action={logoutAction}>
      <AuthSubmitButton>{t("logout")}</AuthSubmitButton>
    </form>
  );
}
