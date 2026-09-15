"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import styles from "./TravelersSettings.module.scss";

type TravelersSettingsSheetProps = {
  open: boolean;
  title: string;
  /** Optional subtitle under the title (e.g. traveler name). */
  subtitle?: string;
  /** Optional tertiary line (e.g. current role). */
  meta?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function TravelersSettingsSheet({
  open,
  title,
  subtitle,
  meta,
  onClose,
  children,
  footer,
}: TravelersSettingsSheetProps) {
  const tCommon = useTranslations("Common");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

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

  const hasDescription = Boolean(subtitle || meta);

  return (
    <dialog
      ref={dialogRef}
      className={styles.overlay}
      aria-labelledby={titleId}
      aria-describedby={hasDescription ? descId : undefined}
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
      <div
        className={styles.sheetPanel}
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
            </div>
          ) : null}
        </header>
        <div className={styles.sheetContent}>{children}</div>
        {footer ? (
          <footer className={styles.sheetFoot}>{footer}</footer>
        ) : (
          <footer className={styles.sheetFoot}>
            <button
              type="button"
              className={styles.sheetCancel}
              onClick={onClose}
            >
              {tCommon("cancel")}
            </button>
          </footer>
        )}
      </div>
    </dialog>
  );
}
