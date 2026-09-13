"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  buildLanguageCategoryHref,
  buildLanguageFavoritesHref,
  buildLanguageHref,
} from "./constants";
import { PHRASEBOOK_CATEGORIES, type PhrasebookCategory } from "./types";
import styles from "./LanguagePage.module.scss";

type CategoryGridProps = {
  tripId: string;
  categoryLabels: Record<PhrasebookCategory, string>;
  activeCategory?: string | null;
  showFavorites?: boolean;
};

export function CategoryGrid({
  tripId,
  categoryLabels,
  activeCategory,
  showFavorites,
}: CategoryGridProps) {
  const t = useTranslations("Language");

  return (
    <nav className={styles.categoryNav} aria-label={t("categoryNavAria")}>
      <Link
        href={buildLanguageFavoritesHref(tripId)}
        className={[
          styles.categoryChip,
          showFavorites ? styles.categoryChipActive : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        ⭐ {t("errors.favoritesSection")}
      </Link>
      <Link
        href={buildLanguageHref(tripId)}
        className={[
          styles.categoryChip,
          !activeCategory && !showFavorites ? styles.categoryChipActive : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {t("errors.showAll")}
      </Link>
      {PHRASEBOOK_CATEGORIES.map((category) => (
        <Link
          key={category}
          href={buildLanguageCategoryHref(tripId, category)}
          className={[
            styles.categoryChip,
            activeCategory === category ? styles.categoryChipActive : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {categoryLabels[category]}
        </Link>
      ))}
    </nav>
  );
}
