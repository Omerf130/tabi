"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button/Button";
import type { EmptyStateAction } from "./types";
import styles from "./EmptyState.module.scss";

export type EmptyStateActionsTone = "strong" | "normal" | "subtle";

type EmptyStateActionsProps = {
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  layout?: "stack" | "inline";
  /** Controls primary CTA visual weight (variant-level default from EmptyState). */
  tone?: EmptyStateActionsTone;
};

function resolvePrimaryPresentation(
  action: EmptyStateAction,
  tone: EmptyStateActionsTone,
): { buttonVariant: "primary" | "secondary"; linkClass: string; buttonSize: "default" | "compact" } {
  const explicit = action.variant;
  if (explicit === "secondary") {
    return {
      buttonVariant: "secondary",
      linkClass: styles.actionLinkSecondary,
      buttonSize: tone === "strong" ? "default" : "compact",
    };
  }
  if (explicit === "primary" && tone === "subtle") {
    return {
      buttonVariant: "secondary",
      linkClass: styles.actionLinkSecondary,
      buttonSize: "compact",
    };
  }

  if (tone === "subtle") {
    return {
      buttonVariant: "secondary",
      linkClass: styles.actionLinkSecondary,
      buttonSize: "compact",
    };
  }

  if (tone === "strong") {
    return {
      buttonVariant: "primary",
      linkClass: styles.actionLinkPrimaryStrong,
      buttonSize: "default",
    };
  }

  return {
    buttonVariant: "primary",
    linkClass: styles.actionLinkPrimary,
    buttonSize: "compact",
  };
}

function ActionControl({
  action,
  tone,
}: {
  action: EmptyStateAction;
  tone: EmptyStateActionsTone;
}) {
  const presentation = resolvePrimaryPresentation(action, tone);

  if ("href" in action) {
    return (
      <Link href={action.href} className={presentation.linkClass}>
        {action.label}
      </Link>
    );
  }

  return (
    <Button
      type="button"
      variant={presentation.buttonVariant}
      size={presentation.buttonSize}
      onClick={action.onClick}
    >
      {action.label}
    </Button>
  );
}

function SecondaryActionControl({ action }: { action: EmptyStateAction }) {
  if ("href" in action) {
    return (
      <Link href={action.href} className={styles.actionTextLink}>
        {action.label}
      </Link>
    );
  }

  return (
    <button type="button" className={styles.actionTextLinkButton} onClick={action.onClick}>
      {action.label}
    </button>
  );
}

export function EmptyStateActions({
  primaryAction,
  secondaryAction,
  layout = "stack",
  tone = "normal",
}: EmptyStateActionsProps) {
  if (!primaryAction && !secondaryAction) {
    return null;
  }

  const secondaryUsesTextLink = tone === "strong" && secondaryAction;

  return (
    <div className={styles.actions} data-layout={layout} data-tone={tone}>
      {primaryAction ? <ActionControl action={primaryAction} tone={tone} /> : null}
      {secondaryAction ? (
        secondaryUsesTextLink ? (
          <SecondaryActionControl action={secondaryAction} />
        ) : (
          <ActionControl action={{ ...secondaryAction, variant: "secondary" }} tone="subtle" />
        )
      ) : null}
    </div>
  );
}

export function InlineTextAction({
  action,
  children,
}: {
  action: EmptyStateAction;
  children?: ReactNode;
}) {
  if ("href" in action) {
    return (
      <Link href={action.href} className={styles.inlineLink}>
        {children ?? action.label}
      </Link>
    );
  }

  return (
    <button type="button" className={styles.inlineLinkButton} onClick={action.onClick}>
      {children ?? action.label}
    </button>
  );
}
