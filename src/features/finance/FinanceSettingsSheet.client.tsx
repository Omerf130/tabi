"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { CurrencyPicker } from "@/features/currency/CurrencyPicker.client";
import type { CurrencyOption } from "@/features/currency/types";
import {
  updateTripFinanceSettingsAction,
  type FinanceSettingsActionState,
} from "./actions";
import { FINANCE_MESSAGES } from "./constants";
import type { PublicTripFinanceSettings } from "./types";
import styles from "./FinancePage.module.scss";

const initialState: FinanceSettingsActionState = {};

type FinanceSettingsSheetProps = {
  tripId: string;
  settings: PublicTripFinanceSettings;
  currencies: readonly CurrencyOption[];
  baseCurrencyLocked: boolean;
  onClose: () => void;
};

export function FinanceSettingsSheet({
  tripId,
  settings,
  currencies,
  baseCurrencyLocked,
  onClose,
}: FinanceSettingsSheetProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [state, formAction] = useActionState(
    updateTripFinanceSettingsAction,
    initialState,
  );
  const [baseCurrency, setBaseCurrency] = useState(settings.baseCurrency);
  const [pickerOpen, setPickerOpen] = useState(false);

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

  const selectedCurrency = currencies.find((currency) => currency.code === baseCurrency);

  function handleClose() {
    onClose();
  }

  return (
    <>
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
          <input type="hidden" name="baseCurrency" value={baseCurrency} />

          <header className={styles.settingsHeader}>
            <h2 id={titleId} className={styles.settingsTitle}>
              {FINANCE_MESSAGES.settingsTitle}
            </h2>
            <button
              type="button"
              className={styles.settingsClose}
              onClick={handleClose}
              aria-label="סגירה"
            >
              ×
            </button>
          </header>

          <Field label={FINANCE_MESSAGES.budgetAmountLabel} htmlFor="budgetAmount">
            <Input
              id="budgetAmount"
              name="budgetAmount"
              inputMode="decimal"
              defaultValue={
                settings.budgetAmount !== null ? String(settings.budgetAmount) : ""
              }
              placeholder="לדוגמה: 30000"
              dir="ltr"
            />
          </Field>

          <Field label={FINANCE_MESSAGES.baseCurrencyLabel} htmlFor="baseCurrency">
            {baseCurrencyLocked ? (
              <p className={styles.lockedCurrency}>
                {selectedCurrency?.hebrewName ?? baseCurrency} ({baseCurrency})
              </p>
            ) : (
              <button
                type="button"
                className={styles.currencySelectButton}
                onClick={() => setPickerOpen(true)}
              >
                <span>{selectedCurrency?.hebrewName ?? baseCurrency}</span>
                <span className={styles.currencyCode}>{baseCurrency}</span>
              </button>
            )}
          </Field>

          {state.error ? <p className={styles.formError}>{state.error}</p> : null}

          <div className={styles.settingsActions}>
            {settings.budgetAmount !== null ? (
              <Button type="submit" name="clearBudget" value="true" variant="secondary">
                {FINANCE_MESSAGES.clearBudget}
              </Button>
            ) : null}
            <Button type="submit">{FINANCE_MESSAGES.saveSettings}</Button>
          </div>
        </form>
      </dialog>

      {pickerOpen && !baseCurrencyLocked ? (
        <CurrencyPicker
          currencies={currencies}
          selectedCode={baseCurrency}
          onSelect={setBaseCurrency}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </>
  );
}
