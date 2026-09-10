"use client";

import { useActionState, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { buildCurrencyRateHref } from "@/features/currency/constants";
import { CurrencyPicker } from "@/features/currency/CurrencyPicker.client";
import {
  convertAmount,
  formatCurrencyAmount,
  parseAmount,
  roundForCurrency,
} from "@/features/currency/convert";
import type { CurrencyOption } from "@/features/currency/types";
import { ACTIVITY_COST_CATEGORIES } from "./entity-cost-schema";
import {
  createManualExpenseAction,
  deleteManualExpenseAction,
  removeLinkedExpenseCostAction,
  updateLinkedExpenseAction,
  updateManualExpenseAction,
  type ManualExpenseActionState,
} from "./actions";
import { getExpenseCategoryPresentation } from "./category-presentation";
import { EXPENSE_CATEGORIES, FINANCE_MESSAGES } from "./constants";
import type { ExpenseCategory, ExpenseRowViewModel } from "./types";
import styles from "./FinancePage.module.scss";

const initialState: ManualExpenseActionState = {};

type FinanceExpenseSheetProps = {
  tripId: string;
  baseCurrency: string;
  currencies: readonly CurrencyOption[];
  expense?: ExpenseRowViewModel;
  onClose: () => void;
};

export function FinanceExpenseSheet({
  tripId,
  baseCurrency,
  currencies,
  expense,
  onClose,
}: FinanceExpenseSheetProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const isEdit = Boolean(expense);
  const isLinked = expense?.isLinked ?? false;
  const isManual = !isLinked;

  const createAction = createManualExpenseAction;
  const editAction = isLinked ? updateLinkedExpenseAction : updateManualExpenseAction;
  const action = isEdit ? editAction : createAction;
  const [state, formAction] = useActionState(action, initialState);

  const categoryOptions = isLinked && expense?.categoryEditable
    ? ACTIVITY_COST_CATEGORIES
    : EXPENSE_CATEGORIES;

  const [category, setCategory] = useState<ExpenseCategory>(
    expense?.category ?? "food",
  );
  const [currency, setCurrency] = useState(expense?.originalCurrency ?? baseCurrency);
  const [amount, setAmount] = useState(
    expense ? String(expense.originalAmount) : "",
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [crossPreview, setCrossPreview] = useState<{
    key: string;
    value: number | null;
    error: boolean;
  }>({ key: "", value: null, error: false });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const selectedCurrency = currencies.find((entry) => entry.code === currency);
  const parsedAmount = useMemo(() => {
    const parsed = parseAmount(amount);
    return parsed && parsed > 0 ? parsed : null;
  }, [amount]);
  const previewKey = `${parsedAmount ?? ""}:${currency}:${baseCurrency}`;

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

  useEffect(() => {
    if (!parsedAmount || currency === baseCurrency) {
      return;
    }

    let cancelled = false;

    fetch(buildCurrencyRateHref(tripId, currency, baseCurrency))
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("rate failed");
        }
        return response.json() as Promise<{ rate: number }>;
      })
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setCrossPreview({
          key: previewKey,
          value: roundForCurrency(
            convertAmount(parsedAmount, payload.rate),
            baseCurrency,
          ),
          error: false,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setCrossPreview({ key: previewKey, value: null, error: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [parsedAmount, baseCurrency, currency, previewKey, tripId]);

  const previewBase = useMemo(() => {
    if (!parsedAmount) {
      return null;
    }
    if (currency === baseCurrency) {
      return roundForCurrency(parsedAmount, baseCurrency);
    }
    if (crossPreview.key !== previewKey) {
      return null;
    }
    return crossPreview.value;
  }, [parsedAmount, currency, baseCurrency, crossPreview, previewKey]);

  const previewError =
    Boolean(parsedAmount) &&
    currency !== baseCurrency &&
    crossPreview.key === previewKey &&
    crossPreview.error;

  const previewLabel = useMemo(() => {
    if (previewBase === null) {
      return null;
    }
    return formatCurrencyAmount(previewBase, baseCurrency);
  }, [previewBase, baseCurrency]);

  function handleClose() {
    onClose();
  }

  const amountCurrencyFields = (
    <>
      <div className={styles.amountRow}>
        <Field label={FINANCE_MESSAGES.amountLabel} htmlFor="expense-amount">
          <Input
            id="expense-amount"
            name="amount"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="8,400"
            dir="ltr"
            required
          />
        </Field>

        <Field label={FINANCE_MESSAGES.currencyLabel} htmlFor="expense-currency">
          <button
            id="expense-currency"
            type="button"
            className={styles.currencySelectButton}
            onClick={() => setPickerOpen(true)}
          >
            <span>{selectedCurrency?.symbol ?? currency}</span>
            <span className={styles.currencyCode}>{currency}</span>
          </button>
        </Field>
      </div>

      {previewLabel ? (
        <p className={styles.conversionPreview}>
          ≈ {previewLabel} ({FINANCE_MESSAGES.conversionPreview})
        </p>
      ) : null}
      {previewError ? (
        <p className={styles.conversionPreviewError}>
          {FINANCE_MESSAGES.conversionPreviewFailed}
        </p>
      ) : null}
    </>
  );

  const categoryPicker =
    isManual || expense?.categoryEditable ? (
      <div className={styles.categoryPickerSection}>
        <span className={styles.fieldLabel}>{FINANCE_MESSAGES.categoryLabel}</span>
        <div
          className={styles.categoryGrid}
          role="radiogroup"
          aria-label={FINANCE_MESSAGES.categoryLabel}
        >
          {categoryOptions.map((entry) => {
            const presentation = getExpenseCategoryPresentation(entry);
            const Icon = presentation.Icon;
            const selected = category === entry;
            return (
              <button
                key={entry}
                type="button"
                className={styles.categoryChip}
                data-selected={selected ? "true" : "false"}
                style={
                  selected
                    ? {
                        backgroundColor: presentation.softColor,
                        color: presentation.color,
                        borderColor: presentation.color,
                      }
                    : undefined
                }
                onClick={() => setCategory(entry)}
                aria-pressed={selected}
              >
                <Icon className={styles.categoryChipIcon} aria-hidden />
                <span>{presentation.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    ) : (
      <div className={styles.linkedCategoryReadonly}>
        <span className={styles.fieldLabel}>{FINANCE_MESSAGES.categoryLabel}</span>
        <p className={styles.linkedCategoryValue}>{expense?.categoryLabel}</p>
      </div>
    );

  return (
    <>
      <dialog
        ref={dialogRef}
        className={styles.expenseDialog}
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
        <form action={formAction} className={styles.expenseForm}>
          <input type="hidden" name="tripId" value={tripId} />
          {expense ? <input type="hidden" name="expenseId" value={expense.id} /> : null}
          {(isManual || expense?.categoryEditable) && category ? (
            <input type="hidden" name="category" value={category} />
          ) : null}
          <input type="hidden" name="currency" value={currency} />

          <header className={styles.expenseFormHeader}>
            <button
              type="button"
              className={styles.sheetClose}
              onClick={handleClose}
              aria-label={FINANCE_MESSAGES.cancel}
            >
              ×
            </button>
            <div className={styles.expenseFormHeading}>
              <h2 id={titleId} className={styles.expenseFormTitle}>
                {isEdit ? FINANCE_MESSAGES.editExpense : FINANCE_MESSAGES.addExpense}
              </h2>
              <p className={styles.expenseFormSubtitle}>
                {isLinked && expense?.linkedSourceLabel
                  ? expense.linkedSourceLabel
                  : FINANCE_MESSAGES.addExpenseSubtitle}
              </p>
            </div>
          </header>

          {isLinked && expense ? (
            <div className={styles.linkedSourceTitle}>
              <span className={styles.fieldLabel}>פריט מקור</span>
              <p className={styles.linkedSourceTitleValue}>{expense.title}</p>
            </div>
          ) : null}

          {amountCurrencyFields}

          {isManual ? (
            <>
              <Field label={FINANCE_MESSAGES.titleLabel} htmlFor="expense-title">
                <Input
                  id="expense-title"
                  name="title"
                  defaultValue={expense?.title ?? ""}
                  placeholder="Sushi Dai, 7-Eleven..."
                  required
                />
              </Field>

              {categoryPicker}

              <Field label={FINANCE_MESSAGES.dateLabel} htmlFor="expense-date">
                <Input
                  id="expense-date"
                  name="expenseDate"
                  type="date"
                  defaultValue={expense?.expenseDate ?? ""}
                  required
                />
              </Field>

              <Field label={FINANCE_MESSAGES.notesLabel} htmlFor="expense-notes">
                <Textarea
                  id="expense-notes"
                  name="notes"
                  defaultValue={expense?.notes ?? ""}
                  rows={3}
                />
              </Field>
            </>
          ) : (
            categoryPicker
          )}

          {state.error ? <p className={styles.formError}>{state.error}</p> : null}

          <div className={styles.expenseFormActions}>
            {isEdit ? (
              <DeleteExpenseButton
                tripId={tripId}
                expenseId={expense!.id}
                isLinked={isLinked}
                confirmDelete={confirmDelete}
                onConfirm={() => setConfirmDelete(true)}
                onDeleted={() => {
                  router.refresh();
                  onClose();
                }}
              />
            ) : null}
            <Button type="button" variant="secondary" onClick={handleClose}>
              {FINANCE_MESSAGES.cancel}
            </Button>
            <Button type="submit">{FINANCE_MESSAGES.saveExpense}</Button>
          </div>
        </form>
      </dialog>

      {pickerOpen ? (
        <CurrencyPicker
          currencies={currencies}
          selectedCode={currency}
          onSelect={setCurrency}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </>
  );
}

function DeleteExpenseButton({
  tripId,
  expenseId,
  isLinked,
  confirmDelete,
  onConfirm,
  onDeleted,
}: {
  tripId: string;
  expenseId: string;
  isLinked: boolean;
  confirmDelete: boolean;
  onConfirm: () => void;
  onDeleted: () => void;
}) {
  const deleteAction = isLinked ? removeLinkedExpenseCostAction : deleteManualExpenseAction;
  const [state, formAction] = useActionState(deleteAction, initialState);

  useEffect(() => {
    if (state.ok) {
      onDeleted();
    }
  }, [state.ok, onDeleted]);

  const label = isLinked ? FINANCE_MESSAGES.removeLinkedCost : FINANCE_MESSAGES.deleteExpense;
  const confirmLabel = isLinked
    ? FINANCE_MESSAGES.removeLinkedCostConfirm
    : FINANCE_MESSAGES.deleteExpenseConfirm;

  if (!confirmDelete) {
    return (
      <Button type="button" variant="danger" onClick={onConfirm}>
        {label}
      </Button>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="expenseId" value={expenseId} />
      <Button type="submit" variant="danger">
        {confirmLabel}
      </Button>
    </form>
  );
}
