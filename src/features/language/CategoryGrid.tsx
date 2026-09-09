import Link from "next/link";
import {
  buildLanguageCategoryHref,
  buildLanguageFavoritesHref,
  buildLanguageHref,
  PHRASEBOOK_MESSAGES,
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
  return (
    <nav className={styles.categoryNav} aria-label="קטגוריות ביטויים">
      <Link
        href={buildLanguageFavoritesHref(tripId)}
        className={[
          styles.categoryChip,
          showFavorites ? styles.categoryChipActive : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        ⭐ {PHRASEBOOK_MESSAGES.favoritesSection}
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
        {PHRASEBOOK_MESSAGES.showAll}
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
