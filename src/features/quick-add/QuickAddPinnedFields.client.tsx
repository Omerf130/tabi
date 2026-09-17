"use client";

import type { ReactNode } from "react";
import { plannerFormScrollClass } from "./quick-add-pinned-form";

type QuickAddPinnedFieldsProps = {
  pinnedActionFooter?: boolean;
  children: ReactNode;
};

export function QuickAddPinnedFields({
  pinnedActionFooter,
  children,
}: QuickAddPinnedFieldsProps) {
  if (!pinnedActionFooter) {
    return children;
  }
  return <div className={plannerFormScrollClass}>{children}</div>;
}
