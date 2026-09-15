"use client";

import { useEffect, useId, useRef } from "react";
import { useTranslations } from "next-intl";
import { CurrencyPickerList } from "./CurrencyPickerList.client";
import type { CurrencyOption } from "./types";
import styles from "./CurrencyConverter.module.scss";

type CurrencyPickerProps = {
  currencies: readonly CurrencyOption[];
  selectedCode: string;
  onSelect: (code: string) => void;
  onClose: () => void;
};

export function CurrencyPicker({
  currencies,
  selectedCode,
  onSelect,
  onClose,
}: CurrencyPickerProps) {
  const t = useTranslations("Currency");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) {
      return;
    }

    dialog.showModal();

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  function handleClose() {
    onClose();
  }

  function handleSelect(code: string) {
    onSelect(code);
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.picker}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          handleClose();
        }
      }}
    >
      <div className={styles.pickerInner}>
        <div className={styles.pickerHeader}>
          <h2 id={titleId} className={styles.pickerTitle}>
            {t("pickerTitle")}
          </h2>
          <button
            type="button"
            className={styles.pickerClose}
            onClick={handleClose}
            aria-label={t("close")}
          >
            ×
          </button>
        </div>

        <CurrencyPickerList
          currencies={currencies}
          selectedCode={selectedCode}
          onSelect={handleSelect}
        />
      </div>
    </dialog>
  );
}
