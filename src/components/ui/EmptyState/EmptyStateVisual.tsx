import type { ReactNode } from "react";
import { EmptyStateMotifScenery } from "./EmptyStateMotifScenery";
import type {
  EmptyStateVisualMotif,
  EmptyStateVisualScale,
} from "./empty-state-visual.types";
import styles from "./EmptyStateVisual.module.scss";

export type { EmptyStateVisualMotif, EmptyStateVisualScale };

/** @deprecated Use EmptyStateVisualScale */
export type EmptyStateVisualVariant = EmptyStateVisualScale;

type EmptyStateVisualProps = {
  scale: EmptyStateVisualScale;
  icon: ReactNode;
  accentIcon?: ReactNode;
  motif?: EmptyStateVisualMotif;
  /** Section/config only — icon-only treatment without rich motif scenery. */
  minimal?: boolean;
};

export function EmptyStateVisual({
  scale,
  icon,
  accentIcon,
  motif = "generic",
  minimal = false,
}: EmptyStateVisualProps) {
  const isMinimal = minimal || scale === "inline" || scale === "search";

  if (isMinimal) {
    return (
      <div className={styles.stage} data-scale={scale} data-motif={motif} aria-hidden="true">
        <span className={styles.minimalIcon}>{icon}</span>
      </div>
    );
  }

  const showPrimaryOnHero = motif === "travel" && scale === "full";

  return (
    <div className={styles.stage} data-scale={scale} data-motif={motif} aria-hidden="true">
      <EmptyStateMotifScenery motif={motif} scale={scale} />

      <div className={styles.foreground}>
        {!showPrimaryOnHero ? <span className={styles.primaryIcon}>{icon}</span> : null}
        {accentIcon ? <span className={styles.accentIcon}>{accentIcon}</span> : null}
      </div>
    </div>
  );
}
