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
};

const INITIAL_STATE: UpdateUserLocaleState = {};

export function InterfaceLanguagePreference({
  currentLocale,
}: InterfaceLanguagePreferenceProps) {
  const t = useTranslations("AccountMenu");
  const tErrors = useTranslations("Errors");
  const [state, formAction, pending] = useActionState(
    updateUserLocaleAction,
    INITIAL_STATE,
  );

  return (
    <div className={styles.root}>
      <p className={styles.label}>{t("interfaceLanguage")}</p>
      <form action={formAction} className={styles.options}>
        {(["he", "en"] as const).map((locale) => (
          <button
            key={locale}
            type="submit"
            name="locale"
            value={locale}
            className={styles.option}
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
