"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ConfigNotice } from "@/components/ui/ConfigNotice";
import { ProviderAlert } from "@/components/ui/ProviderAlert";
import { IconDictionary, IconMapPin } from "@/components/ui/icons";
import { CustomPhraseTranslator } from "./CustomPhraseTranslator.client";
import { CategoryGrid } from "./CategoryGrid";
import { LanguagePhraseListEmpty } from "./LanguagePhraseListEmpty.client";
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

  const normalizedQuery = normalizeSearchText(query);
  const phraseListEmptyMode = normalizedQuery
    ? "search"
    : showFavorites
      ? "favorites"
      : "filtered";

  if (runtimeState === "unknown_travel_language") {
    return (
      <div className={styles.page}>
        <ConfigNotice
          className={styles.languageConfigNotice}
          visual={{
            motif: "generic",
            icon: <IconDictionary aria-hidden />,
            accentIcon: <IconMapPin aria-hidden />,
          }}
          title={tRuntime("unresolvedTravelLanguageTitle")}
          description={tRuntime("unresolvedTravelLanguageBody")}
          primaryAction={{
            label: tRuntime("updateTripDetails"),
            href: tripDetailsHref,
          }}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {translationWarning ? (
        <ProviderAlert
          className={styles.translationProviderAlert}
          tone="warning"
          icon={<IconDictionary aria-hidden />}
          message={tRuntime("translationUnavailable")}
        />
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
        <LanguagePhraseListEmpty
          tripId={tripId}
          mode={phraseListEmptyMode}
          onClearSearch={() => setQuery("")}
        />
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
