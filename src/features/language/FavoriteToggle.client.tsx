"use client";

import { useActionState } from "react";
import { togglePhraseFavoriteAction, type PhraseFavoriteActionState } from "./actions";
import { DEFAULT_PHRASEBOOK_PACK_ID, PHRASEBOOK_MESSAGES } from "./constants";
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
  const [state, formAction] = useActionState(togglePhraseFavoriteAction, initialState);

  const isFavorite =
    state.ok && state.phraseId === phraseId && state.isFavorite !== undefined
      ? state.isFavorite
      : initialIsFavorite;

  const label = isFavorite
    ? PHRASEBOOK_MESSAGES.favoriteRemove
    : PHRASEBOOK_MESSAGES.favoriteAdd;

  return (
    <form action={formAction} className={styles.favoriteForm}>
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="phraseId" value={phraseId} />
      <input type="hidden" name="packId" value={DEFAULT_PHRASEBOOK_PACK_ID} />
      <button
        type="submit"
        className={compact ? styles.favoriteButtonCompact : styles.favoriteButton}
        aria-label={label}
        aria-pressed={isFavorite}
      >
        <span aria-hidden>{isFavorite ? "★" : "☆"}</span>
      </button>
      {state.error ? (
        <span className={styles.favoriteError} role="alert">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}
