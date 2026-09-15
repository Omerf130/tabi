"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { IconBack, IconCurrency } from "@/components/ui/icons";
import { updateUserHomeCurrencyAction } from "@/features/currency/actions/update-user-home-currency";
import { buildCurrencyHref } from "@/features/currency/constants";
import { CurrencyPickerList } from "@/features/currency/CurrencyPickerList.client";
import { findCurrencyOption } from "@/features/currency/currency-metadata";
import type { CurrencyOption } from "@/features/currency/types";
import {
  updateTripFinanceSettingsAction,
  type FinanceSettingsActionState,
} from "@/features/finance/actions";
import { resolveAppLocale } from "@/features/i18n/locale";
import { buildSettingsHubHref } from "@/features/settings/constants";
import { TripDetailsSettingsRow } from "@/features/trips/settings/trip-details/TripDetailsSettingsRow";
import tripDetailsStyles from "@/features/trips/settings/trip-details/TripDetailsSettings.module.scss";
import { TravelersSettingsSheet } from "@/features/trips/settings/travelers/TravelersSettingsSheet.client";
import travelerSheetStyles from "@/features/trips/settings/travelers/TravelersSettings.module.scss";
import {
  formatCurrencySettingsLabel,
  formatCurrencySettingsSecondary,
} from "./format-currency-settings-label";
import {
  homeCurrencyPickerSelectedCode,
  isHomeCurrencySaveEnabled,
  isTripCurrencySaveEnabled,
  tripCurrencyPickerSelectedCode,
} from "./currency-settings-save-state";
import styles from "./CurrencySettings.module.scss";

type CurrencySettingsClientProps = {
  tripId: string;
  isOwner: boolean;
  tripBaseCurrency: string;
  baseCurrencyLocked: boolean;
  homeCurrency: string | null;
  currencies: readonly CurrencyOption[];
};

const financeActionInitial: FinanceSettingsActionState = {};

export function CurrencySettingsClient({
  tripId,
  isOwner,
  tripBaseCurrency,
  baseCurrencyLocked,
  homeCurrency,
  currencies,
}: CurrencySettingsClientProps) {
  const t = useTranslations("CurrencySettings");
  const tCommon = useTranslations("Common");
  const tFinanceErrors = useTranslations("Finance.errors");
  const locale = resolveAppLocale(useLocale());
  const router = useRouter();

  const [tripSheetOpen, setTripSheetOpen] = useState(false);
  const [homeSheetOpen, setHomeSheetOpen] = useState(false);
  const [tripCurrencyDraft, setTripCurrencyDraft] = useState(tripBaseCurrency);
  const [homeCurrencyDraft, setHomeCurrencyDraft] = useState<string | null>(
    homeCurrency,
  );
  const [pending, startTransition] = useTransition();

  const [tripState, tripDispatch] = useActionState(
    updateTripFinanceSettingsAction,
    financeActionInitial,
  );
  const [homeState, homeDispatch] = useActionState(updateUserHomeCurrencyAction, {});

  const tripOption = findCurrencyOption(currencies, tripBaseCurrency);
  const homeOption = homeCurrency
    ? findCurrencyOption(currencies, homeCurrency)
    : undefined;

  const canEditTripCurrency = isOwner && !baseCurrencyLocked;

  useEffect(() => {
    if (tripState.ok || homeState.ok) {
      router.refresh();
    }
  }, [tripState.ok, homeState.ok, router]);

  function openTripCurrencySheet() {
    setTripCurrencyDraft(tripBaseCurrency);
    setTripSheetOpen(true);
  }

  function openHomeCurrencySheet() {
    setHomeCurrencyDraft(homeCurrency);
    setHomeSheetOpen(true);
  }

  function closeTripCurrencySheet() {
    setTripSheetOpen(false);
    setTripCurrencyDraft(tripBaseCurrency);
  }

  function closeHomeCurrencySheet() {
    setHomeSheetOpen(false);
    setHomeCurrencyDraft(homeCurrency);
  }

  function tripRowValue(): string {
    return formatCurrencySettingsLabel(tripOption, tripBaseCurrency, locale);
  }

  function homeRowValue(): string {
    if (!homeCurrency) {
      return t("notSelected");
    }
    const primary = formatCurrencySettingsLabel(homeOption, homeCurrency, locale);
    const secondary = formatCurrencySettingsSecondary(homeOption, homeCurrency);
    return secondary !== homeCurrency ? `${primary} (${secondary})` : primary;
  }

  function saveTripCurrency() {
    if (
      !isTripCurrencySaveEnabled({
        draft: tripCurrencyDraft,
        saved: tripBaseCurrency,
        pending,
      })
    ) {
      return;
    }
    setTripSheetOpen(false);
    startTransition(() => {
      const formData = new FormData();
      formData.set("tripId", tripId);
      formData.set("baseCurrency", tripCurrencyDraft);
      tripDispatch(formData);
    });
  }

  function saveHomeCurrency() {
    if (
      !isHomeCurrencySaveEnabled({
        draft: homeCurrencyDraft,
        saved: homeCurrency,
        pending,
      })
    ) {
      return;
    }
    setHomeSheetOpen(false);
    startTransition(() => {
      const formData = new FormData();
      formData.set("homeCurrency", homeCurrencyDraft!);
      homeDispatch(formData);
    });
  }

  const tripError = tripState.errorCode
    ? tFinanceErrors(tripState.errorCode)
    : null;
  const homeError =
    homeState.errorCode === "invalid_currency" ||
    homeState.errorCode === "unsupported_currency"
      ? t("errors.invalidCurrency")
      : null;

  function renderPickerFooter(
    onCancel: () => void,
    onSave: () => void,
    saveDisabled: boolean,
  ) {
    return (
      <div className={travelerSheetStyles.sheetFootActions}>
        <button
          type="button"
          className={travelerSheetStyles.sheetCancel}
          onClick={onCancel}
        >
          {tCommon("cancel")}
        </button>
        <button
          type="button"
          className={travelerSheetStyles.sheetSaveSecondary}
          disabled={saveDisabled}
          onClick={onSave}
        >
          {t("save")}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link href={buildSettingsHubHref(tripId)} className={styles.back}>
        <IconBack className={styles.backIcon} aria-hidden />
        <span>{t("back")}</span>
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>{t("pageTitle")}</h1>
        <p className={styles.lead}>{t("lead")}</p>
      </header>

      <section aria-labelledby="trip-currency-label">
        <h2 id="trip-currency-label" className={styles.sectionLabel}>
          {t("tripCurrencySection")}
        </h2>
        <p className={styles.sectionHint}>{t("tripCurrencyHint")}</p>
        <div className={styles.group} role="list">
          <TripDetailsSettingsRow
            label={t("tripCurrencySection")}
            value={tripRowValue()}
            icon={<IconCurrency className={tripDetailsStyles.rowIconSvg} />}
            valueMuted={!canEditTripCurrency}
            onPress={canEditTripCurrency ? openTripCurrencySheet : undefined}
            showChevron={canEditTripCurrency}
            dir="auto"
          />
        </div>
        {baseCurrencyLocked ? (
          <p className={styles.lockedNote}>{t("tripCurrencyLocked")}</p>
        ) : null}
        {tripError && !tripSheetOpen ? (
          <p className={styles.inlineError} role="alert">
            {tripError}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="my-currency-label">
        <h2 id="my-currency-label" className={styles.sectionLabel}>
          {t("myCurrencySection")}
        </h2>
        <p className={styles.sectionHint}>{t("myCurrencyHint")}</p>
        <div className={styles.group} role="list">
          <TripDetailsSettingsRow
            label={t("myCurrencySection")}
            value={homeRowValue()}
            icon={<IconCurrency className={tripDetailsStyles.rowIconSvg} />}
            valueMuted={!homeCurrency}
            onPress={openHomeCurrencySheet}
            showChevron
            dir="auto"
          />
        </div>
        {homeError && !homeSheetOpen ? (
          <p className={styles.inlineError} role="alert">
            {homeError}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="converter-label">
        <h2 id="converter-label" className={styles.sectionLabel}>
          {t("converterSection")}
        </h2>
        <div className={styles.group} role="list">
          <TripDetailsSettingsRow
            label={t("openConverter")}
            value={t("openConverterHint")}
            icon={<IconCurrency className={tripDetailsStyles.rowIconSvg} />}
            href={buildCurrencyHref(tripId)}
            showChevron
          />
        </div>
      </section>

      {tripSheetOpen ? (
        <TravelersSettingsSheet
          open
          variant="picker"
          title={t("changeTripCurrency")}
          lead={t("pickerHint")}
          onClose={closeTripCurrencySheet}
          footer={() =>
            renderPickerFooter(
              closeTripCurrencySheet,
              saveTripCurrency,
              !isTripCurrencySaveEnabled({
                draft: tripCurrencyDraft,
                saved: tripBaseCurrency,
                pending,
              }),
            )
          }
        >
          {tripError ? (
            <p className={styles.inlineError} role="alert">
              {tripError}
            </p>
          ) : null}
          <CurrencyPickerList
            currencies={currencies}
            selectedCode={tripCurrencyPickerSelectedCode(tripCurrencyDraft)}
            onSelect={setTripCurrencyDraft}
            embeddedInSheet
          />
        </TravelersSettingsSheet>
      ) : null}

      {homeSheetOpen ? (
        <TravelersSettingsSheet
          open
          variant="picker"
          title={homeCurrency ? t("changeMyCurrency") : t("chooseMyCurrency")}
          lead={t("pickerHint")}
          onClose={closeHomeCurrencySheet}
          footer={() =>
            renderPickerFooter(
              closeHomeCurrencySheet,
              saveHomeCurrency,
              !isHomeCurrencySaveEnabled({
                draft: homeCurrencyDraft,
                saved: homeCurrency,
                pending,
              }),
            )
          }
        >
          {homeError ? (
            <p className={styles.inlineError} role="alert">
              {homeError}
            </p>
          ) : null}
          <CurrencyPickerList
            currencies={currencies}
            selectedCode={homeCurrencyPickerSelectedCode(homeCurrencyDraft)}
            onSelect={(code) => setHomeCurrencyDraft(code)}
            embeddedInSheet
          />
        </TravelersSettingsSheet>
      ) : null}
    </div>
  );
}
