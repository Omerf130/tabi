"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { togglePhraseFavoriteAction, type PhraseFavoriteActionState } from "./actions";
import { PHRASEBOOK_ERROR_CODES } from "./constants";
import styles from "./LanguagePage.module.scss";

const initialState: PhraseFavoriteActionState = {};

type FavoriteToggleProps = {
  tripId: string;
  phraseId: string;
  initialIsFavorite: boolean;
  compact?: boolean;
};

export function FavoriteToggle({
  tripId,
  phraseId,
  initialIsFavorite,
  compact = false,
}: FavoriteToggleProps) {
  const t = useTranslations("Language.errors");
  const [state, formAction] = useActionState(togglePhraseFavoriteAction, initialState);

  const isFavorite =
    state.ok && state.phraseId === phraseId && state.isFavorite !== undefined
      ? state.isFavorite
      : initialIsFavorite;

  const label = isFavorite ? t("favoriteRemove") : t("favoriteAdd");
  const errorMessage =
    state.errorCode === PHRASEBOOK_ERROR_CODES.favoriteFailed
      ? t("favoriteFailed")
      : state.errorCode
        ? t("favoriteFailed")
        : undefined;

  return (
    <form action={formAction} className={styles.favoriteForm}>
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="phraseId" value={phraseId} />
      <button
        type="submit"
        className={compact ? styles.favoriteButtonCompact : styles.favoriteButton}
        aria-label={label}
        aria-pressed={isFavorite}
      >
        <span aria-hidden>{isFavorite ? "★" : "☆"}</span>
      </button>
      {errorMessage ? (
        <span className={styles.favoriteError} role="alert">
          {errorMessage}
        </span>
      ) : null}
    </form>
  );
}
