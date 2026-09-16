"use client";

import { useEffect, useId, useRef } from "react";
import { useTranslations } from "next-intl";
import styles from "./PwaInstall.module.scss";

type PwaInstallIosInstructionsProps = {
  open: boolean;
  onClose: () => void;
};

export function PwaInstallIosInstructions({
  open,
  onClose,
}: PwaInstallIosInstructionsProps) {
  const t = useTranslations("PwaInstall");
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
      className={styles.iosSheet}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
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
      <div className={styles.iosSheetInner}>
        <header className={styles.iosSheetHeader}>
          <h2 id={titleId} className={styles.iosSheetTitle}>
            {t("iosTitle")}
          </h2>
          <button
            type="button"
            className={styles.iosSheetClose}
            onClick={onClose}
            aria-label={tCommon("close")}
          >
            ×
          </button>
        </header>
        <p id={descriptionId} className={styles.iosSheetIntro}>
          {t("iosIntro")}
        </p>
        <ol className={styles.iosSteps}>
          <li>{t("iosStep1")}</li>
          <li>{t("iosStep2")}</li>
          <li>{t("iosStep3")}</li>
        </ol>
        <div className={styles.iosSheetFooter}>
          <button
            type="button"
            className={styles.iosDismiss}
            onClick={onClose}
          >
            {tCommon("close")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
