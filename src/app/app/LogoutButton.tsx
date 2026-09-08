"use client";

import { logoutAction } from "@/features/auth/actions";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <AuthSubmitButton>יציאה</AuthSubmitButton>
    </form>
  );
}
