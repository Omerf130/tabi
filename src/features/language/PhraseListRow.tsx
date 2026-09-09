import Link from "next/link";
import type { PhraseListItemViewModel } from "./types";
import { FavoriteToggle } from "./FavoriteToggle.client";
import styles from "./LanguagePage.module.scss";

type PhraseListRowProps = {
  tripId: string;
  phrase: PhraseListItemViewModel;
};

export function PhraseListRow({ tripId, phrase }: PhraseListRowProps) {
  return (
    <li className={styles.phraseRow}>
      <Link href={phrase.detailHref} className={styles.phraseLink}>
        <div className={styles.phraseMain}>
          <p className={styles.phraseSource} dir="auto">
            {phrase.sourceText}
          </p>
          <p className={styles.phraseTargetPreview} lang="ja" dir="ltr">
            {phrase.targetTextPreview}
          </p>
        </div>
      </Link>
      <FavoriteToggle
        tripId={tripId}
        phraseId={phrase.id}
        initialIsFavorite={phrase.isFavorite}
        compact
      />
    </li>
  );
}
