"use client";

import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { EmptyStateVisualMotif } from "@/components/ui/EmptyState/empty-state-visual.types";

type TripSettingsCollectionEmptyProps = {
  title: string;
  icon: ReactNode;
  motif?: EmptyStateVisualMotif;
  className?: string;
};

export function TripSettingsCollectionEmpty({
  title,
  icon,
  motif = "generic",
  className,
}: TripSettingsCollectionEmptyProps) {
  return (
    <EmptyState
      variant="section"
      visualDensity="compact"
      className={className}
      visual={{ motif, icon }}
      title={title}
    />
  );
}
