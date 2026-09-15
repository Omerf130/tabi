"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  updateUserLocaleAction,
  type UpdateUserLocaleState,
} from "@/features/i18n/actions/update-user-locale";
import type { AppLocale } from "@/features/i18n/locale";
import styles from "./InterfaceLanguagePreference.module.scss";

type InterfaceLanguagePreferenceProps = {
  currentLocale: AppLocale;
  variant?: "default" | "settingsList";
};

const INITIAL_STATE: UpdateUserLocaleState = {};

export function InterfaceLanguagePreference({
  currentLocale,
  variant = "default",
}: InterfaceLanguagePreferenceProps) {
  const t = useTranslations("AccountMenu");
  const tErrors = useTranslations("Errors");
  const [state, formAction, pending] = useActionState(
    updateUserLocaleAction,
    INITIAL_STATE,
  );

  const rootClass =
    variant === "settingsList" ? `${styles.root} ${styles.rootSettingsList}` : styles.root;
  const optionsClass =
    variant === "settingsList"
      ? `${styles.options} ${styles.optionsSettingsList}`
      : styles.options;
  const optionClass =
    variant === "settingsList" ? `${styles.option} ${styles.optionSettingsList}` : styles.option;

  return (
    <div className={rootClass}>
      {variant === "default" ? (
        <p className={styles.label}>{t("interfaceLanguage")}</p>
      ) : null}
      <form action={formAction} className={optionsClass}>
        {(["he", "en"] as const).map((locale) => (
          <button
            key={locale}
            type="submit"
            name="locale"
            value={locale}
            className={optionClass}
            data-active={currentLocale === locale ? "true" : undefined}
            aria-pressed={currentLocale === locale}
            disabled={pending}
          >
            {locale === "he" ? t("languageHebrew") : t("languageEnglish")}
          </button>
        ))}
      </form>
      {state.errorCode === "invalid_locale" ? (
        <p className={styles.error} role="alert">
          {tErrors("invalidLocale")}
        </p>
      ) : null}
    </div>
  );
}
