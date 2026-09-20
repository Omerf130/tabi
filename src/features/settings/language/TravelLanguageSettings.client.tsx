"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { IconBack } from "@/components/ui/icons";
import { buildSettingsHubHref } from "@/features/settings/constants";
import type { TravelLanguageSettingsViewModel } from "@/features/language/travel-language/build-travel-language-settings-view-model";
import {
  TRIP_TRAVEL_LANGUAGE_ERROR_CODES,
  updateTripTravelLanguageAction,
  type UpdateTripTravelLanguageActionState,
} from "@/features/language/travel-language/update-trip-travel-language-action";
import styles from "./LanguageSettings.module.scss";

const initialState: UpdateTripTravelLanguageActionState = {};

type TravelLanguageSettingsClientProps = TravelLanguageSettingsViewModel;

export function TravelLanguageSettingsClient(props: TravelLanguageSettingsClientProps) {
  const t = useTranslations("Settings.travelLanguagePage");
  const [state, formAction] = useActionState(updateTripTravelLanguageAction, initialState);

  const errorMessage =
    state.errorCode === TRIP_TRAVEL_LANGUAGE_ERROR_CODES.validationFailed
      ? t("errors.validation")
      : state.errorCode
        ? t("errors.generic")
        : undefined;

  const recommendedCodes = new Set(props.recommendedLanguages.map((entry) => entry.code));
  const otherLanguages = props.allLanguages.filter((entry) => !recommendedCodes.has(entry.code));

  return (
    <div className={styles.page}>
      <Link href={buildSettingsHubHref(props.tripId)} className={styles.back}>
        <IconBack className={styles.backIcon} aria-hidden />
        <span>{t("back")}</span>
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.lead}>{t("lead")}</p>
      </header>

      <section className={styles.summarySection} aria-labelledby="travel-language-summary">
        <h2 id="travel-language-summary" className={styles.sectionLabel}>
          {t("summaryTitle")}
        </h2>
        <dl className={styles.summaryList}>
          <div>
            <dt>{t("destinationLabel")}</dt>
            <dd>{props.destinationLabel ?? t("destinationUnknown")}</dd>
          </div>
          <div>
            <dt>{t("destinationDefaultLabel")}</dt>
            <dd>
              {props.destinationDefaultLanguageLabel ?? t("destinationDefaultUnknown")}
            </dd>
          </div>
          <div>
            <dt>{t("effectiveLanguageLabel")}</dt>
            <dd>{props.effectiveLanguageLabel ?? t("effectiveLanguageUnknown")}</dd>
          </div>
          <div>
            <dt>{t("selectionSourceLabel")}</dt>
            <dd>
              {props.selectionSource === "override"
                ? t("selectionSourceOverride")
                : t("selectionSourceAutomatic")}
            </dd>
          </div>
        </dl>
      </section>

      {props.isOwner ? (
        <section aria-labelledby="travel-language-picker">
          <h2 id="travel-language-picker" className={styles.sectionLabel}>
            {t("pickerTitle")}
          </h2>
          <p className={styles.sectionHint}>{t("pickerHint")}</p>

          <form action={formAction} className={styles.travelLanguageForm}>
            <input type="hidden" name="tripId" value={props.tripId} />

            <label className={styles.radioRow}>
              <input
                type="radio"
                name="selectionMode"
                value="automatic"
                defaultChecked={props.selectionSource === "automatic"}
              />
              <span>{t("automaticOption")}</span>
            </label>

            <label className={styles.radioRow}>
              <input
                type="radio"
                name="selectionMode"
                value="manual"
                defaultChecked={props.selectionSource === "override"}
              />
              <span>{t("manualOption")}</span>
            </label>

            <label className={styles.selectLabel} htmlFor="travel-language-code">
              {t("chooseLanguageLabel")}
            </label>
            <select
              id="travel-language-code"
              name="travelLanguageCode"
              defaultValue={props.overrideLanguageCode ?? props.effectiveLanguageCode ?? ""}
              className={styles.languageSelect}
            >
              <option value="">{t("chooseLanguagePlaceholder")}</option>
              {props.recommendedLanguages.length > 0 ? (
                <optgroup label={t("recommendedGroup")}>
                  {props.recommendedLanguages.map((language) => (
                    <option key={`rec-${language.code}`} value={language.code}>
                      {language.label}
                    </option>
                  ))}
                </optgroup>
              ) : null}
              <optgroup label={t("allLanguagesGroup")}>
                {otherLanguages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </optgroup>
            </select>

            <button type="submit" className={styles.saveButton}>
              {t("save")}
            </button>

            {state.ok ? (
              <p className={styles.successMessage} role="status">
                {t("savedSuccess")}
              </p>
            ) : null}
            {errorMessage ? (
              <p className={styles.errorMessage} role="alert">
                {errorMessage}
              </p>
            ) : null}
          </form>
        </section>
      ) : (
        <section aria-labelledby="travel-language-member">
          <h2 id="travel-language-member" className={styles.sectionLabel}>
            {t("memberTitle")}
          </h2>
          <p className={styles.sectionHint}>{t("memberHint")}</p>
        </section>
      )}
    </div>
  );
}
