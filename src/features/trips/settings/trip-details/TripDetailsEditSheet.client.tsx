"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import styles from "./TripDetailsSettings.module.scss";

type TripDetailsEditSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Extra bottom inset for fixed app navigation (mobile). */
  reserveBottomNav?: boolean;
};

export function TripDetailsEditSheet({
  open,
  title,
  onClose,
  children,
  footer,
  reserveBottomNav = true,
}: TripDetailsEditSheetProps) {
  const tCommon = useTranslations("Common");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

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

  return (
    <dialog
      ref={dialogRef}
      className={styles.sheet}
      data-bottom-nav={reserveBottomNav ? "true" : undefined}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className={styles.sheetInner}>
        <header className={styles.sheetHeader}>
          <h2 id={titleId} className={styles.sheetTitle}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.sheetClose}
            onClick={onClose}
            aria-label={tCommon("cancel")}
          >
            ×
          </button>
        </header>
        <div className={styles.sheetBody}>{children}</div>
        {footer ? <footer className={styles.sheetFooter}>{footer}</footer> : null}
      </div>
    </dialog>
  );
}
