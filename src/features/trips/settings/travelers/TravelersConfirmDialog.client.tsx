"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";
import styles from "./TravelersSettings.module.scss";

type TravelersConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  destructive?: boolean;
  children?: ReactNode;
};

export function TravelersConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
  isPending = false,
  destructive = false,
  children,
}: TravelersConfirmDialogProps) {
  const tCommon = useTranslations("Common");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.confirmDialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onCancel();
        }
      }}
    >
      <div className={styles.confirmInner}>
        <header className={styles.confirmHeader}>
          <h2 id={titleId} className={styles.confirmTitle}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.sheetClose}
            onClick={onCancel}
            aria-label={tCommon("cancel")}
          >
            ×
          </button>
        </header>
        <div id={descriptionId} className={styles.confirmBody}>
          <p className={styles.confirmLead}>{description}</p>
          {children}
        </div>
        <footer className={styles.confirmFooter}>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
            {tCommon("cancel")}
          </Button>
          <Button
            type="button"
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={isPending}
          >
            {confirmLabel}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
