"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type ManageAccountFooterGateProps = {
  tripId: string;
  children: ReactNode;
};

/** Hides account footer on dedicated Settings sub-screens (language-only for now). */
export function ManageAccountFooterGate({
  tripId,
  children,
}: ManageAccountFooterGateProps) {
  const pathname = usePathname();
  const languagePath = `/app/trips/${tripId}/manage/language`;

  if (pathname === languagePath || pathname.startsWith(`${languagePath}/`)) {
    return null;
  }

  return children;
}
