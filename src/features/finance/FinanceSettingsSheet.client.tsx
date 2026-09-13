"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { CurrencyPicker } from "@/features/currency/CurrencyPicker.client";
import type { CurrencyOption } from "@/features/currency/types";
import { resolveAppLocale } from "@/features/i18n/locale";
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
  const t = useTranslations("Finance");
  const tErrors = useTranslations("Finance.errors");
  const locale = resolveAppLocale(useLocale());
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
  const currencyDisplayName =
    selectedCurrency &&
    (locale === "he" ? selectedCurrency.hebrewName : selectedCurrency.englishName);

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
              {t("settingsTitle")}
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

          <Field label={t("baseCurrencyLabel")} htmlFor="baseCurrency">
            {baseCurrencyLocked ? (
              <p className={styles.lockedCurrency}>
                {currencyDisplayName ?? baseCurrency} ({baseCurrency})
              </p>
            ) : (
              <button
                type="button"
                className={styles.currencySelectButton}
                onClick={() => setPickerOpen(true)}
              >
                <span>{currencyDisplayName ?? baseCurrency}</span>
                <span className={styles.currencyCode}>{baseCurrency}</span>
              </button>
            )}
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
