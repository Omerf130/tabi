"use client";

import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { closeDialogIfOpen } from "./travelers-settings-request-close";
import styles from "./TravelersSettings.module.scss";

type TravelersSettingsSheetProps = {
  open: boolean;
  title: string;
  /** Optional subtitle under the title (e.g. traveler name). */
  subtitle?: string;
  /** Optional tertiary line (e.g. current role). */
  meta?: string;
  /** Optional short lead under the title (e.g. currency picker hint). */
  lead?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode | ((onRequestClose: () => void) => ReactNode);
  variant?: "default" | "picker";
};

export function TravelersSettingsSheet({
  open,
  title,
  subtitle,
  meta,
  onClose,
  children,
  footer,
  lead,
  variant = "default",
}: TravelersSettingsSheetProps) {
  const tCommon = useTranslations("Common");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  const requestClose = useCallback(() => {
    closeDialogIfOpen(dialogRef.current);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      closeDialogIfOpen(dialog);
    }

    return () => {
      closeDialogIfOpen(dialog);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const hasDescription = Boolean(subtitle || meta || lead);

  return (
    <dialog
      ref={dialogRef}
      className={styles.overlay}
      data-variant={variant === "picker" ? "picker" : undefined}
      aria-labelledby={titleId}
      aria-describedby={hasDescription ? descId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          requestClose();
        }
      }}
    >
      <div
        className={
          variant === "picker"
            ? `${styles.sheetPanel} ${styles.sheetPanelPicker}`
            : styles.sheetPanel
        }
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.sheetHandle} aria-hidden />
        <header className={styles.sheetHead}>
          <h2 id={titleId} className={styles.sheetHeadTitle}>
            {title}
          </h2>
          {hasDescription ? (
            <div id={descId} className={styles.sheetHeadMeta}>
              {subtitle ? (
                <p className={styles.sheetHeadSubtitle} dir="auto">
                  {subtitle}
                </p>
              ) : null}
              {meta ? <p className={styles.sheetHeadRole}>{meta}</p> : null}
              {lead ? <p className={styles.sheetHeadLead}>{lead}</p> : null}
            </div>
          ) : null}
        </header>
        <div className={styles.sheetContent}>{children}</div>
        {footer !== undefined ? (
          <footer className={styles.sheetFoot}>
            {typeof footer === "function" ? footer(onClose) : footer}
          </footer>
        ) : (
          <footer className={styles.sheetFoot}>
            <button
              type="button"
              className={styles.sheetCancel}
              onClick={requestClose}
            >
              {tCommon("cancel")}
            </button>
          </footer>
        )}
      </div>
    </dialog>
  );
}
