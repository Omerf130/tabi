"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { resolveLanguageTextDirection } from "./resolve-language-text-direction";
import styles from "./LanguagePage.module.scss";

type CustomPhraseTranslatorProps = {
  tripId: string;
  enabled: boolean;
  targetLanguage: string | null;
  travelLanguageSettingsHref: string;
};

type CustomTranslationState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; translatedText: string; transliterationLatin: string | null }
  | { status: "validation_error" }
  | { status: "rate_limited" }
  | { status: "unavailable" }
  | { status: "unknown_target" };

export function CustomPhraseTranslator({
  tripId,
  enabled,
  targetLanguage,
  travelLanguageSettingsHref,
}: CustomPhraseTranslatorProps) {
  const t = useTranslations("Language.customTranslator");
  const [text, setText] = useState("");
  const [state, setState] = useState<CustomTranslationState>({ status: "idle" });

  if (!enabled) {
    return (
      <section className={styles.customTranslator} aria-labelledby="custom-translator-title">
        <h2 id="custom-translator-title" className={styles.customTranslatorTitle}>
          {t("title")}
        </h2>
        <p className={styles.customTranslatorDisabled}>{t("unknownTravelLanguage")}</p>
        <Link href={travelLanguageSettingsHref} className={styles.runtimeNoticeAction}>
          {t("openTravelLanguageSettings")}
        </Link>
      </section>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setState({ status: "validation_error" });
      return;
    }

    setState({ status: "submitting" });
    try {
      const response = await fetch(`/app/trips/${tripId}/language/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, text: trimmed }),
      });

      const payload = (await response.json()) as {
        translatedText?: string;
        transliterationLatin?: string | null;
        error?: string;
      };

      if (response.status === 429) {
        setState({ status: "rate_limited" });
        return;
      }
      if (response.status === 422) {
        setState({ status: "unknown_target" });
        return;
      }
      if (!response.ok || !payload.translatedText) {
        setState({ status: "unavailable" });
        return;
      }

      setState({
        status: "success",
        translatedText: payload.translatedText,
        transliterationLatin: payload.transliterationLatin ?? null,
      });
    } catch {
      setState({ status: "unavailable" });
    }
  }

  const targetDirection = resolveLanguageTextDirection(targetLanguage);

  return (
    <section className={styles.customTranslator} aria-labelledby="custom-translator-title">
      <h2 id="custom-translator-title" className={styles.customTranslatorTitle}>
        {t("title")}
      </h2>
      <p className={styles.customTranslatorHint}>{t("hint")}</p>

      <form onSubmit={handleSubmit} className={styles.customTranslatorForm}>
        <label htmlFor="custom-phrase-input" className={styles.searchLabel}>
          {t("inputLabel")}
        </label>
        <textarea
          id="custom-phrase-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={t("placeholder")}
          className={styles.customTranslatorInput}
          rows={3}
          maxLength={500}
          disabled={state.status === "submitting"}
        />
        <button
          type="submit"
          className={styles.customTranslatorButton}
          disabled={state.status === "submitting"}
        >
          {state.status === "submitting" ? t("translating") : t("translate")}
        </button>
      </form>

      {state.status === "validation_error" ? (
        <p className={styles.customTranslatorError} role="alert">
          {t("validationError")}
        </p>
      ) : null}
      {state.status === "rate_limited" ? (
        <p className={styles.customTranslatorError} role="alert">
          {t("rateLimited")}
        </p>
      ) : null}
      {state.status === "unavailable" ? (
        <p className={styles.customTranslatorError} role="alert">
          {t("unavailable")}
        </p>
      ) : null}
      {state.status === "unknown_target" ? (
        <p className={styles.customTranslatorError} role="alert">
          {t("unknownTravelLanguage")}
        </p>
      ) : null}

      {state.status === "success" ? (
        <div className={styles.customTranslatorResult}>
          <p
            className={styles.customTranslatorResultText}
            lang={targetLanguage ?? undefined}
            dir={targetDirection}
          >
            {state.translatedText}
          </p>
          {state.transliterationLatin ? (
            <>
              <p className={styles.customTranslatorPronunciationLabel}>
                {t("pronunciationLatinLabel")}
              </p>
              <p className={styles.customTranslatorTransliteration} dir="ltr">
                {state.transliterationLatin}
              </p>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
