"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { CustomPhraseTranslator } from "./CustomPhraseTranslator.client";
import { CategoryGrid } from "./CategoryGrid";
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
  runtimeState,
  tripDetailsHref,
  translationWarning,
  travelLanguageSettingsHref,
  customTranslationEnabled,
  targetLanguage,
  initialCategory = null,
  showFavorites = false,
}: LanguagePageClientProps) {
  const t = useTranslations("Language.errors");
  const tRuntime = useTranslations("Language.runtime");
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

  if (runtimeState === "unknown_travel_language") {
    return (
      <div className={styles.page}>
        <div className={styles.runtimeNotice} role="status">
          <p className={styles.runtimeNoticeTitle}>{tRuntime("unresolvedTravelLanguageTitle")}</p>
          <p className={styles.runtimeNoticeBody}>{tRuntime("unresolvedTravelLanguageBody")}</p>
          <Link href={tripDetailsHref} className={styles.runtimeNoticeAction}>
            {tRuntime("updateTripDetails")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {translationWarning ? (
        <p className={styles.runtimeWarning} role="status">
          {tRuntime("translationUnavailable")}
        </p>
      ) : null}

      <div className={styles.searchWrap}>
        <label htmlFor="phrase-search" className={styles.searchLabel}>
          {t("searchPlaceholder")}
        </label>
        <input
          id="phrase-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
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
          {showFavorites ? t("noFavorites") : t("noResults")}
        </p>
      ) : (
        <ul className={styles.phraseList}>
          {displayedPhrases.map((phrase) => (
            <PhraseListRow key={phrase.id} tripId={tripId} phrase={phrase} />
          ))}
        </ul>
      )}

      <CustomPhraseTranslator
        tripId={tripId}
        enabled={customTranslationEnabled}
        targetLanguage={targetLanguage}
        travelLanguageSettingsHref={travelLanguageSettingsHref}
      />
    </div>
  );
}
