"use client";

import type { ReactNode } from "react";
import {
  EmptyStateActions,
  InlineTextAction,
  type EmptyStateActionsTone,
} from "./EmptyStateActions";
import { EmptyStateVisual } from "./EmptyStateVisual";
import type { EmptyStateVisualConfig } from "./empty-state-visual.types";
import type {
  EmptyStateAction,
  EmptyStateSectionSurface,
  EmptyStateTitleElement,
  EmptyStateVariant,
} from "./types";
import styles from "./EmptyState.module.scss";

function resolveVisualConfig(input: {
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
      motif: "generic",
    };
  }
  return null;
}

export type EmptyStateProps = {
  variant: EmptyStateVariant;
  /** Preferred visual configuration (icon + optional accent + presentation motif). */
  visual?: EmptyStateVisualConfig;
  /** @deprecated Use `visual.icon` */
  icon?: ReactNode;
  /** @deprecated Use `visual.accentIcon` */
  accentIcon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  /** Section only — default surface is a soft contained panel. */
  surface?: EmptyStateSectionSurface;
  /** Full / section / search heading level; inline defaults to `p` when title is shown. */
  titleAs?: EmptyStateTitleElement;
  /** Section only — compact icon treatment for dense surfaces (e.g. Home). */
  visualDensity?: "default" | "compact";
  className?: string;
};

function defaultTitleAs(
  variant: EmptyStateVariant,
  titleAs: EmptyStateTitleElement | undefined,
): EmptyStateTitleElement {
  if (titleAs) {
    return titleAs;
  }
  if (variant === "inline") {
    return "p";
  }
  if (variant === "search") {
    return "h3";
  }
  return "h2";
}

function actionToneForVariant(variant: EmptyStateVariant): EmptyStateActionsTone {
  switch (variant) {
    case "full":
      return "strong";
    case "search":
      return "subtle";
    default:
      return "normal";
  }
}

function Title({
  as: Tag,
  className,
  children,
}: {
  as: EmptyStateTitleElement;
  className: string;
  children: ReactNode;
}) {
  return <Tag className={className}>{children}</Tag>;
}

export function EmptyState({
  variant,
  visual,
  icon,
  accentIcon,
  title,
  description,
  primaryAction,
  secondaryAction,
  surface = "default",
  titleAs,
  visualDensity = "default",
  className,
}: EmptyStateProps) {
  const heading = defaultTitleAs(variant, titleAs);
  const rootClass = [
    styles.root,
    styles[variant],
    variant === "section" && visualDensity === "compact" ? styles.sectionCompact : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const actionTone = actionToneForVariant(variant);
  const visualConfig = resolveVisualConfig({ visual, icon, accentIcon });
  const minimalVisual = visualDensity === "compact" && variant === "section";

  if (variant === "inline") {
    const linkAction = secondaryAction ?? primaryAction;

    return (
      <div className={rootClass} data-variant={variant}>
        {visualConfig ? (
          <EmptyStateVisual
            scale="inline"
            icon={visualConfig.icon}
            accentIcon={visualConfig.accentIcon}
            motif={visualConfig.motif ?? "generic"}
          />
        ) : null}
        <div className={styles.inlineBody}>
          <div className={styles.inlineCopy}>
            {title ? (
              <Title as={heading} className={styles.inlineTitle}>
                {title}
              </Title>
            ) : null}
            {!title && description ? (
              <p className={styles.inlineMessage}>{description}</p>
            ) : null}
            {title && description ? (
              <p className={styles.inlineDescription}>{description}</p>
            ) : null}
          </div>
          {linkAction ? (
            <div className={styles.inlineActionSlot}>
              <InlineTextAction action={linkAction} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const showActions = primaryAction || secondaryAction;

  return (
    <section
      className={rootClass}
      data-variant={variant}
      data-surface={variant === "section" ? surface : undefined}
    >
      {visualConfig ? (
        <EmptyStateVisual
          scale={variant}
          icon={visualConfig.icon}
          accentIcon={visualConfig.accentIcon}
          motif={visualConfig.motif ?? "generic"}
          minimal={minimalVisual}
        />
      ) : null}

      <div className={styles.copy}>
        {title ? (
          <Title as={heading} className={styles.title}>
            {title}
          </Title>
        ) : null}
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>

      {showActions ? (
        <EmptyStateActions
          primaryAction={primaryAction}
          secondaryAction={secondaryAction}
          layout={variant === "search" ? "inline" : "stack"}
          tone={actionTone}
        />
      ) : null}
    </section>
  );
}
