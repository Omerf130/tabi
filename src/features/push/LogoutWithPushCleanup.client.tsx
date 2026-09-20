"use client";

import type { ReactNode } from "react";
import { logoutAction } from "@/features/auth/actions";
import { bestEffortDisablePushOnLogout } from "./push-device-sync.client";

type LogoutWithPushCleanupProps = {
  children: ReactNode;
  className?: string;
};

export function LogoutWithPushCleanup({
  children,
  className,
}: LogoutWithPushCleanupProps) {
  return (
    <form
      className={className}
      onSubmit={async (event) => {
        event.preventDefault();
        await bestEffortDisablePushOnLogout();
        await logoutAction();
      }}
    >
      {children}
    </form>
  );
}
