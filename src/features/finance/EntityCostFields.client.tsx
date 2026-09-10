"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { CurrencyPicker } from "@/features/currency/CurrencyPicker.client";
import type { CurrencyOption } from "@/features/currency/types";
import { ACTIVITY_COST_CATEGORIES } from "./entity-cost-schema";
import { getExpenseCategoryPresentation } from "./category-presentation";
import { FINANCE_MESSAGES } from "./constants";
import type { EntityLinkedCostViewModel, ExpenseCategory } from "./types";
import styles from "./EntityCostFields.module.scss";

type EntityCostFieldsProps = {
  baseCurrency: string;
  currencies: readonly CurrencyOption[];
  linkedCost?: EntityLinkedCostViewModel | null;
  showCategory?: boolean;
  idPrefix?: string;
};

export function EntityCostFields({
  baseCurrency,
  currencies,
  linkedCost,
  showCategory = false,
  idPrefix = "entity-cost",
}: EntityCostFieldsProps) {
  const [currency, setCurrency] = useState(linkedCost?.currency ?? baseCurrency);
  const [category, setCategory] = useState<ExpenseCategory>(
    linkedCost?.category ?? "activities",
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedCurrency = currencies.find((entry) => entry.code === currency);

  return (
    <section className={styles.section} aria-labelledby={`${idPrefix}-title`}>
      <div className={styles.divider} aria-hidden />
      <h3 id={`${idPrefix}-title`} className={styles.title}>
        {FINANCE_MESSAGES.entityCostSectionTitle}
      </h3>
      <p className={styles.helper}>{FINANCE_MESSAGES.entityCostHelper}</p>

      <input type="hidden" name="costCurrency" value={currency} />
      {showCategory ? <input type="hidden" name="costCategory" value={category} /> : null}

      <div className={styles.amountRow}>
        <Field label={FINANCE_MESSAGES.amountLabel} htmlFor={`${idPrefix}-amount`}>
          <Input
            id={`${idPrefix}-amount`}
            name="costAmount"
            inputMode="decimal"
            defaultValue={linkedCost ? String(linkedCost.amount) : ""}
            placeholder="4,200"
            dir="ltr"
          />
        </Field>

        <Field label={FINANCE_MESSAGES.currencyLabel} htmlFor={`${idPrefix}-currency`}>
          <button
            id={`${idPrefix}-currency`}
            type="button"
            className={styles.currencyButton}
            onClick={() => setPickerOpen(true)}
          >
            <span>{selectedCurrency?.symbol ?? currency}</span>
            <span className={styles.currencyCode}>{currency}</span>
          </button>
        </Field>
      </div>

      {showCategory ? (
        <div className={styles.categorySection}>
          <span className={styles.categoryLabel}>
            {FINANCE_MESSAGES.activityCostCategoryLabel}
          </span>
          <div
            className={styles.categoryGrid}
            role="radiogroup"
            aria-label={FINANCE_MESSAGES.activityCostCategoryLabel}
          >
            {ACTIVITY_COST_CATEGORIES.map((entry) => {
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
                  <Icon className={styles.categoryIcon} aria-hidden />
                  <span>{presentation.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {pickerOpen ? (
        <CurrencyPicker
          currencies={currencies}
          selectedCode={currency}
          onSelect={setCurrency}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </section>
  );
}
