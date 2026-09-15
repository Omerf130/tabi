"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import {
  updateTripFinanceSettingsAction,
  type FinanceSettingsActionState,
} from "./actions";
import type { PublicTripFinanceSettings } from "./types";
import styles from "./FinancePage.module.scss";

const initialState: FinanceSettingsActionState = {};

type FinanceSettingsSheetProps = {
  tripId: string;
  settings: PublicTripFinanceSettings;
  onClose: () => void;
};

export function FinanceSettingsSheet({
  tripId,
  settings,
  onClose,
}: FinanceSettingsSheetProps) {
  const t = useTranslations("Finance");
  const tErrors = useTranslations("Finance.errors");
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [state, formAction] = useActionState(
    updateTripFinanceSettingsAction,
    initialState,
  );

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

  useEffect(() => {
    if (state.ok) {
      router.refresh();
      onClose();
    }
  }, [state.ok, router, onClose]);

  function handleClose() {
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.settingsDialog}
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
      <form action={formAction} className={styles.settingsForm}>
        <input type="hidden" name="tripId" value={tripId} />

        <header className={styles.settingsHeader}>
          <h2 id={titleId} className={styles.settingsTitle}>
            {t("budgetSettingsTitle")}
          </h2>
          <button
            type="button"
            className={styles.settingsClose}
            onClick={handleClose}
            aria-label={t("close")}
          >
            ×
          </button>
        </header>

        <Field label={t("budgetAmountLabel")} htmlFor="budgetAmount">
          <Input
            id="budgetAmount"
            name="budgetAmount"
            inputMode="decimal"
            defaultValue={
              settings.budgetAmount !== null ? String(settings.budgetAmount) : ""
            }
            placeholder={t("budgetAmountPlaceholder")}
            dir="ltr"
          />
        </Field>

        {state.errorCode ? (
          <p className={styles.formError}>{tErrors(state.errorCode)}</p>
        ) : null}

        <div className={styles.settingsActions}>
          {settings.budgetAmount !== null ? (
            <Button type="submit" name="clearBudget" value="true" variant="secondary">
              {t("clearBudget")}
            </Button>
          ) : null}
          <Button type="submit">{t("saveSettings")}</Button>
        </div>
      </form>
    </dialog>
  );
}
