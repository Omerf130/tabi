"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildCurrencyRateHref, CURRENCY_MESSAGES } from "./constants";
import {
  convertAmount,
  formatCurrencyAmount,
  formatRateDate,
  formatRateValue,
  invertExchangeRate,
  makeRatePairKey,
  normalizeAmountInput,
  parseAmount,
  roundForCurrency,
} from "./convert";
import { IconChevron } from "@/components/ui/icons";
import { findCurrencyOption } from "./currency-metadata";
import { resolveNextCurrencyPair } from "./currency-selection";
import {
  resolveInitialCurrencyPair,
  writeCurrencyPairPreference,
} from "./currency-preferences";
import { CurrencyPicker } from "./CurrencyPicker.client";
import type { CurrencyConverterInitialData, ExchangeRate } from "./types";
import styles from "./CurrencyConverter.module.scss";

type CurrencyConverterProps = CurrencyConverterInitialData;

type PickerTarget = "from" | "to" | null;

function createInitialRateState(
  initialPair: { from: string; to: string },
  initialRate: ExchangeRate | null,
): {
  rate: ExchangeRate | null;
  loadFailed: boolean;
  rateCache: Record<string, ExchangeRate>;
} {
  const hasMatchingInitialRate =
    initialRate !== null &&
    initialRate.from === initialPair.from &&
    initialRate.to === initialPair.to;

  return {
    rate: hasMatchingInitialRate ? initialRate : null,
    loadFailed: !hasMatchingInitialRate,
    rateCache: hasMatchingInitialRate
      ? { [makeRatePairKey(initialRate.from, initialRate.to)]: initialRate }
      : {},
  };
}

export function CurrencyConverter({
  tripId,
  currencies,
  initialFrom,
  initialTo,
  initialAmount,
  initialRate,
}: CurrencyConverterProps) {
  const initialPair = useMemo(
    () => resolveInitialCurrencyPair(currencies, initialFrom, initialTo),
    [currencies, initialFrom, initialTo],
  );
  const initialRateState = useMemo(
    () => createInitialRateState(initialPair, initialRate),
    [initialPair, initialRate],
  );

  const [fromCurrency, setFromCurrency] = useState(initialPair.from);
  const [toCurrency, setToCurrency] = useState(initialPair.to);
  const [amountInput, setAmountInput] = useState(initialAmount);
  const [rate, setRate] = useState<ExchangeRate | null>(initialRateState.rate);
  const [rateCache, setRateCache] = useState<Record<string, ExchangeRate>>(
    initialRateState.rateCache,
  );
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [loadFailed, setLoadFailed] = useState(initialRateState.loadFailed);
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const initialFetchStartedRef = useRef(false);

  const fromOption = findCurrencyOption(currencies, fromCurrency);
  const toOption = findCurrencyOption(currencies, toCurrency);

  const fetchRate = useCallback(
    async (
      from: string,
      to: string,
      allowStaleFallback: boolean,
      forceRefresh = false,
    ) => {
      const pairKey = makeRatePairKey(from, to);
      const cached = rateCache[pairKey];

      if (cached && !forceRefresh) {
        setRate(cached);
        setLoadFailed(false);
        setRefreshFailed(false);
        return cached;
      }

      setIsFetchingRate(true);
      try {
        const response = await fetch(buildCurrencyRateHref(tripId, from, to));
        if (!response.ok) {
          throw new Error("rate fetch failed");
        }

        const nextRate = (await response.json()) as ExchangeRate;
        setRateCache((current) => ({
          ...current,
          [makeRatePairKey(nextRate.from, nextRate.to)]: nextRate,
        }));
        setRate(nextRate);
        setLoadFailed(false);
        setRefreshFailed(false);
        return nextRate;
      } catch {
        if (allowStaleFallback && cached) {
          setRate(cached);
          setLoadFailed(false);
          setRefreshFailed(true);
          return cached;
        }

        if (allowStaleFallback && rate && rate.from === from && rate.to === to) {
          setRefreshFailed(true);
          setLoadFailed(false);
          return rate;
        }

        setLoadFailed(true);
        setRefreshFailed(false);
        return null;
      } finally {
        setIsFetchingRate(false);
      }
    },
    [rate, rateCache, tripId],
  );

  useEffect(() => {
    if (initialFetchStartedRef.current || !initialRateState.loadFailed) {
      return;
    }

    initialFetchStartedRef.current = true;
    void fetchRate(initialPair.from, initialPair.to, false);
  }, [fetchRate, initialPair.from, initialPair.to, initialRateState.loadFailed]);

  useEffect(() => {
    writeCurrencyPairPreference({ from: fromCurrency, to: toCurrency });
  }, [fromCurrency, toCurrency]);

  const parsedAmount = parseAmount(amountInput);
  const convertedAmount =
    parsedAmount !== null && rate
      ? roundForCurrency(convertAmount(parsedAmount, rate.rate), toCurrency)
      : null;

  const formattedResult =
    convertedAmount !== null
      ? formatCurrencyAmount(convertedAmount, toCurrency)
      : "—";

  const unitRate = useMemo(() => {
    if (!rate || parsedAmount === null || parsedAmount <= 0 || convertedAmount === null) {
      return null;
    }

    return convertedAmount / parsedAmount;
  }, [convertedAmount, parsedAmount, rate]);

  function handleAmountChange(value: string) {
    setAmountInput(normalizeAmountInput(value));
  }

  function handleSwap() {
    if (fromCurrency === toCurrency) {
      return;
    }

    const nextFrom = toCurrency;
    const nextTo = fromCurrency;
    const directKey = makeRatePairKey(fromCurrency, toCurrency);
    const inverseKey = makeRatePairKey(nextFrom, nextTo);
    const directRate =
      rateCache[directKey] ??
      (rate?.from === fromCurrency && rate.to === toCurrency ? rate : null);

    setFromCurrency(nextFrom);
    setToCurrency(nextTo);

    if (rateCache[inverseKey]) {
      setRate(rateCache[inverseKey]);
      setLoadFailed(false);
      setRefreshFailed(false);
      return;
    }

    if (directRate) {
      const inverted = invertExchangeRate(directRate.rate);
      if (inverted !== null) {
        const invertedRate: ExchangeRate = {
          from: nextFrom,
          to: nextTo,
          rate: inverted,
          date: directRate.date,
        };
        setRateCache((current) => ({
          ...current,
          [inverseKey]: invertedRate,
        }));
        setRate(invertedRate);
        setLoadFailed(false);
        setRefreshFailed(false);
        return;
      }
    }

    void fetchRate(nextFrom, nextTo, true);
  }

  function handleCurrencySelect(code: string) {
    if (!pickerTarget) {
      return;
    }

    const nextPair = resolveNextCurrencyPair(
      { from: fromCurrency, to: toCurrency },
      pickerTarget,
      code,
    );

    setFromCurrency(nextPair.from);
    setToCurrency(nextPair.to);
    void fetchRate(nextPair.from, nextPair.to, true);
  }

  function handleRetry() {
    void fetchRate(fromCurrency, toCurrency, false, true);
  }

  function handlePickerClose() {
    setPickerTarget(null);
  }

  if (!fromOption || !toOption) {
    return (
      <div className={styles.errorBlock}>
        <p className={styles.errorText}>{CURRENCY_MESSAGES.invalidCurrency}</p>
      </div>
    );
  }

  return (
    <div className={styles.converter}>
      <div className={styles.panels}>
        <section className={styles.panel} aria-label="מטבע מקור">
          <div className={styles.panelHeader}>
            <button
              type="button"
              className={styles.currencyButton}
              onClick={() => setPickerTarget("from")}
              aria-haspopup="dialog"
              aria-expanded={pickerTarget === "from"}
              aria-label={`בחירת מטבע מקור: ${fromOption.code} ${fromOption.hebrewName}`}
            >
              <span className={styles.currencyIdentity}>
                <span className={styles.currencyCode}>{fromOption.code}</span>
                <span className={styles.currencyName}>{fromOption.hebrewName}</span>
              </span>
              <IconChevron className={styles.currencyChevron} aria-hidden />
            </button>
            <div className={styles.amountArea}>
              <span className={styles.amountSymbol}>{fromOption.symbol}</span>
              <input
                type="text"
                inputMode="decimal"
                className={styles.amountInput}
                value={amountInput}
                onChange={(event) => handleAmountChange(event.target.value)}
                aria-label="סכום להמרה"
                autoComplete="off"
              />
            </div>
          </div>
        </section>

        <div className={styles.swapRow}>
          <button
            type="button"
            className={styles.swapButton}
            onClick={handleSwap}
            disabled={isFetchingRate}
            aria-label="החלפת מטבעות"
          >
            ⇅
          </button>
        </div>

        <section className={styles.panel} aria-label="מטבע יעד">
          <div className={styles.panelHeader}>
            <button
              type="button"
              className={styles.currencyButton}
              onClick={() => setPickerTarget("to")}
              aria-haspopup="dialog"
              aria-expanded={pickerTarget === "to"}
              aria-label={`בחירת מטבע יעד: ${toOption.code} ${toOption.hebrewName}`}
            >
              <span className={styles.currencyIdentity}>
                <span className={styles.currencyCode}>{toOption.code}</span>
                <span className={styles.currencyName}>{toOption.hebrewName}</span>
              </span>
              <IconChevron className={styles.currencyChevron} aria-hidden />
            </button>
            <div className={styles.amountArea}>
              <span className={styles.amountSymbol}>{toOption.symbol}</span>
              <p className={styles.resultAmount}>{formattedResult}</p>
            </div>
          </div>
        </section>
      </div>

      {loadFailed ? (
        <div className={styles.errorBlock}>
          <p className={styles.errorText}>{CURRENCY_MESSAGES.loadRateFailed}</p>
          <button type="button" className={styles.retryButton} onClick={handleRetry}>
            {CURRENCY_MESSAGES.retry}
          </button>
        </div>
      ) : rate && unitRate !== null ? (
        <div className={styles.meta}>
          <p className={styles.rateLine}>
            1 {fromCurrency} = {formatRateValue(unitRate)} {toCurrency}
          </p>
          <p className={styles.rateDate}>
            {CURRENCY_MESSAGES.estimatedRate} · {formatRateDate(rate.date)}
          </p>
          {refreshFailed ? (
            <p className={styles.refreshNotice}>{CURRENCY_MESSAGES.refreshFailed}</p>
          ) : null}
        </div>
      ) : null}

      <p className={styles.disclaimer}>{CURRENCY_MESSAGES.disclaimer}</p>

      {pickerTarget !== null ? (
        <CurrencyPicker
          currencies={currencies}
          selectedCode={pickerTarget === "from" ? fromCurrency : toCurrency}
          onSelect={handleCurrencySelect}
          onClose={handlePickerClose}
        />
      ) : null}
    </div>
  );
}
