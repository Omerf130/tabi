import type { ReactNode } from "react";
import type { EmptyStateVisualMotif } from "./empty-state-visual.types";
import { EmptyStateVisual, type EmptyStateVisualScale } from "./EmptyStateVisual";
import type { EmptyStateVariant } from "./types";

type EmptyStateIconProps = {
  variant: EmptyStateVariant;
  children: ReactNode;
  accentIcon?: ReactNode;
  motif?: EmptyStateVisualMotif;
};

export function EmptyStateIcon({ variant, children, accentIcon, motif }: EmptyStateIconProps) {
  return (
    <EmptyStateVisual
      scale={variant as EmptyStateVisualScale}
      icon={children}
      accentIcon={accentIcon}
      motif={motif}
    />
  );
}

export { EmptyStateVisual };
