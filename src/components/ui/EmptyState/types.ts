import type { ReactNode } from "react";
import type { EmptyStateVisualConfig } from "./empty-state-visual.types";

export type { EmptyStateVisualConfig, EmptyStateVisualMotif } from "./empty-state-visual.types";

export type EmptyStateVariant = "full" | "section" | "inline" | "search";

export type EmptyStateActionVariant = "primary" | "secondary";

export type EmptyStateAction = {
  label: ReactNode;
  variant?: EmptyStateActionVariant;
} & ({ href: string } | { onClick: () => void });

export type EmptyStateSectionSurface = "default" | "subtle-bordered";

export type EmptyStateTitleElement = "h2" | "h3" | "p";

export type EmptyStatePropsVisual = EmptyStateVisualConfig;
