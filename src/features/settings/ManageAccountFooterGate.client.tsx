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
  const mapsPath = `/app/trips/${tripId}/manage/maps`;

  if (pathname === languagePath || pathname.startsWith(`${languagePath}/`)) {
    return null;
  }
  if (pathname === mapsPath || pathname.startsWith(`${mapsPath}/`)) {
    return null;
  }

  return children;
}
