"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  filterCurrencyOptions,
  getPriorityCurrencies,
} from "./currency-metadata";
import { resolveAppLocale } from "@/features/i18n/locale";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconSearch } from "@/components/ui/icons";
import type { CurrencyOption } from "./types";
import styles from "./CurrencyConverter.module.scss";

export type CurrencyPickerListProps = {
  currencies: readonly CurrencyOption[];
  selectedCode: string;
  onSelect: (code: string) => void;
  /** When false, list stays open after selection (Settings sheet flow). */
  closeOnSelect?: boolean;
  /** Fills a settings bottom sheet with an internal scroll region. */
  embeddedInSheet?: boolean;
  className?: string;
};

function getCurrencyDisplayName(currency: CurrencyOption, locale: "he" | "en"): string {
  return locale === "he" ? currency.hebrewName : currency.englishName;
}

export function CurrencyPickerList({
  currencies,
  selectedCode,
  onSelect,
  closeOnSelect = false,
  embeddedInSheet = false,
  className,
}: CurrencyPickerListProps) {
  const t = useTranslations("Currency");
  const locale = resolveAppLocale(useLocale());
  const [query, setQuery] = useState("");

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

  function handleSelect(code: string) {
    onSelect(code);
    if (closeOnSelect) {
      setQuery("");
    }
  }

  const rootClass = [
    styles.pickerListRoot,
    embeddedInSheet ? styles.pickerListRootInSheet : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <input
        type="search"
        className={styles.searchInput}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("searchPlaceholder")}
        autoComplete="off"
        enterKeyHint="search"
        aria-label={t("searchPlaceholder")}
      />

      <div className={styles.pickerSectionsScroll}>
        {filtered.length === 0 ? (
          <EmptyState
            variant="search"
            className={styles.pickerSearchEmpty}
            visual={{ motif: "search", icon: <IconSearch aria-hidden /> }}
            title={t("noResults")}
            description={t("noResultsHint")}
            primaryAction={{
              label: t("clearSearch"),
              onClick: () => setQuery(""),
            }}
          />
        ) : (
          <>
            {priorityFiltered.length > 0 ? (
              <section>
                <h3 className={styles.pickerSectionTitle}>{t("popularSection")}</h3>
                <ul className={styles.pickerList} role="listbox" aria-label={t("pickerTitle")}>
                  {priorityFiltered.map((currency) => (
                    <li key={currency.code} role="presentation">
                      <button
                        type="button"
                        className={styles.pickerOption}
                        role="option"
                        aria-selected={currency.code === selectedCode}
                        data-selected={currency.code === selectedCode}
                        onClick={() => handleSelect(currency.code)}
                      >
                        <span className={styles.pickerOptionLeading}>
                          <span className={styles.pickerOptionCode}>{currency.code}</span>
                          <span className={styles.pickerOptionSymbol}>{currency.symbol}</span>
                        </span>
                        <span className={styles.pickerOptionName}>
                          {getCurrencyDisplayName(currency, locale)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {otherFiltered.length > 0 ? (
              <section>
                <h3 className={styles.pickerSectionTitle}>{t("allSection")}</h3>
                <ul className={styles.pickerList} role="listbox">
                  {otherFiltered.map((currency) => (
                    <li key={currency.code} role="presentation">
                      <button
                        type="button"
                        className={styles.pickerOption}
                        role="option"
                        aria-selected={currency.code === selectedCode}
                        data-selected={currency.code === selectedCode}
                        onClick={() => handleSelect(currency.code)}
                      >
                        <span className={styles.pickerOptionLeading}>
                          <span className={styles.pickerOptionCode}>{currency.code}</span>
                          <span className={styles.pickerOptionSymbol}>{currency.symbol}</span>
                        </span>
                        <span className={styles.pickerOptionName}>
                          {getCurrencyDisplayName(currency, locale)}
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
  );
}
