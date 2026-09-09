"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CURRENCY_MESSAGES } from "./constants";
import {
  filterCurrencyOptions,
  getPriorityCurrencies,
} from "./currency-metadata";
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [query, setQuery] = useState("");

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

  const filtered = useMemo(
    () => filterCurrencyOptions(currencies, query),
    [currencies, query],
  );
  const priorityCodes = useMemo(
    () => new Set(getPriorityCurrencies(currencies).map((currency) => currency.code)),
    [currencies],
  );
  const priorityFiltered = filtered.filter((currency) =>
    priorityCodes.has(currency.code),
  );
  const otherFiltered = filtered.filter(
    (currency) => !priorityCodes.has(currency.code),
  );

  function handleClose() {
    setQuery("");
    onClose();
  }

  function handleSelect(code: string) {
    setQuery("");
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
            בחירת מטבע
          </h2>
          <button
            type="button"
            className={styles.pickerClose}
            onClick={handleClose}
            aria-label="סגירה"
          >
            ×
          </button>
        </div>

        <input
          type="search"
          className={styles.searchInput}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={CURRENCY_MESSAGES.searchPlaceholder}
          autoComplete="off"
          enterKeyHint="search"
        />

        <div className={styles.pickerSections}>
          {filtered.length === 0 ? (
            <p className={styles.emptyResults}>{CURRENCY_MESSAGES.noResults}</p>
          ) : (
            <>
              {priorityFiltered.length > 0 ? (
                <section>
                  <h3 className={styles.pickerSectionTitle}>
                    {CURRENCY_MESSAGES.popularSection}
                  </h3>
                  <ul className={styles.pickerList}>
                    {priorityFiltered.map((currency) => (
                      <li key={currency.code}>
                        <button
                          type="button"
                          className={styles.pickerOption}
                          data-selected={currency.code === selectedCode}
                          onClick={() => handleSelect(currency.code)}
                        >
                          <span className={styles.pickerOptionLeading}>
                            <span className={styles.pickerOptionCode}>
                              {currency.code}
                            </span>
                            <span className={styles.pickerOptionSymbol}>
                              {currency.symbol}
                            </span>
                          </span>
                          <span className={styles.pickerOptionName}>
                            {currency.hebrewName}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {otherFiltered.length > 0 ? (
                <section>
                  <h3 className={styles.pickerSectionTitle}>
                    {CURRENCY_MESSAGES.allSection}
                  </h3>
                  <ul className={styles.pickerList}>
                    {otherFiltered.map((currency) => (
                      <li key={currency.code}>
                        <button
                          type="button"
                          className={styles.pickerOption}
                          data-selected={currency.code === selectedCode}
                          onClick={() => handleSelect(currency.code)}
                        >
                          <span className={styles.pickerOptionLeading}>
                            <span className={styles.pickerOptionCode}>
                              {currency.code}
                            </span>
                            <span className={styles.pickerOptionSymbol}>
                              {currency.symbol}
                            </span>
                          </span>
                          <span className={styles.pickerOptionName}>
                            {currency.hebrewName}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
