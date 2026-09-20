import type { ReactNode } from "react";
import { EmptyStateActions } from "@/components/ui/EmptyState/EmptyStateActions";
import { EmptyStateVisual } from "@/components/ui/EmptyState/EmptyStateVisual";
import type { EmptyStateAction, EmptyStateVisualConfig } from "@/components/ui/EmptyState/types";
import styles from "./ConfigNotice.module.scss";

export type ConfigNoticeProps = {
  visual?: EmptyStateVisualConfig;
  /** @deprecated Use `visual` */
  icon?: ReactNode;
  /** @deprecated Use `visual.accentIcon` */
  accentIcon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
};

function resolveVisual(input: {
  visual?: EmptyStateVisualConfig;
  icon?: ReactNode;
  accentIcon?: ReactNode;
}): EmptyStateVisualConfig | null {
  if (input.visual) {
    return input.visual;
  }
  if (input.icon) {
    return {
      icon: input.icon,
      accentIcon: input.accentIcon,
      motif: "weather",
    };
  }
  return null;
}

export function ConfigNotice({
  visual,
  icon,
  accentIcon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: ConfigNoticeProps) {
  const rootClass = [styles.notice, className].filter(Boolean).join(" ");
  const visualConfig = resolveVisual({ visual, icon, accentIcon });

  return (
    <section className={rootClass} role="status" aria-live="polite">
      {visualConfig ? (
        <EmptyStateVisual
          scale="config"
          icon={visualConfig.icon}
          accentIcon={visualConfig.accentIcon}
          motif={visualConfig.motif ?? "weather"}
        />
      ) : null}

      <div className={styles.copy}>
        <h2 className={styles.title}>{title}</h2>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>

      <EmptyStateActions
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        layout="stack"
        tone="normal"
      />
    </section>
  );
}
