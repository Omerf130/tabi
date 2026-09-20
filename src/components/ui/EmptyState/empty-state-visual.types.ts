import type { ReactNode } from "react";

export type EmptyStateVisualMotif =
  | "travel"
  | "documents"
  | "transport"
  | "weather"
  | "search"
  | "generic";

export type EmptyStateVisualScale = "full" | "section" | "config" | "inline" | "search";

export type EmptyStateVisualConfig = {
  icon: ReactNode;
  accentIcon?: ReactNode;
  motif?: EmptyStateVisualMotif;
};
