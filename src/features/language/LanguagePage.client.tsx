"use client";

import { useMemo, useState } from "react";
import { CategoryGrid } from "./CategoryGrid";
import { PHRASEBOOK_MESSAGES } from "./constants";
import { PhraseListRow } from "./PhraseListRow";
import { normalizeSearchText } from "./search-phrases";
import type { LanguagePageViewModel } from "./types";
import styles from "./LanguagePage.module.scss";

type LanguagePageClientProps = LanguagePageViewModel & {
  initialCategory?: string | null;
  showFavorites?: boolean;
};

export function LanguagePageClient({
  tripId,
  phrases,
  favoritePhraseIds,
  categoryLabels,
  initialCategory = null,
  showFavorites = false,
}: LanguagePageClientProps) {
  const [query, setQuery] = useState("");

  const displayedPhrases = useMemo(() => {
    let items = phrases;

    if (showFavorites) {
      const favoriteSet = new Set(favoritePhraseIds);
      items = items.filter((item) => favoriteSet.has(item.id));
    } else if (initialCategory) {
      items = items.filter((item) => item.category === initialCategory);
    }

    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => item.searchBlob.includes(normalizedQuery));
  }, [phrases, query, showFavorites, favoritePhraseIds, initialCategory]);

  return (
    <div className={styles.page}>
      <div className={styles.searchWrap}>
        <label htmlFor="phrase-search" className={styles.searchLabel}>
          {PHRASEBOOK_MESSAGES.searchPlaceholder}
        </label>
        <input
          id="phrase-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={PHRASEBOOK_MESSAGES.searchPlaceholder}
          className={styles.searchInput}
          autoComplete="off"
        />
      </div>

      <CategoryGrid
        tripId={tripId}
        categoryLabels={categoryLabels}
        activeCategory={initialCategory}
        showFavorites={showFavorites}
      />

      {displayedPhrases.length === 0 ? (
        <p className={styles.emptyState}>
          {showFavorites ? PHRASEBOOK_MESSAGES.noFavorites : PHRASEBOOK_MESSAGES.noResults}
        </p>
      ) : (
        <ul className={styles.phraseList}>
          {displayedPhrases.map((phrase) => (
            <PhraseListRow key={phrase.id} tripId={tripId} phrase={phrase} />
          ))}
        </ul>
      )}
    </div>
  );
}
