import { AppPage } from "@/features/app-shell/AppPage";
import { FavoriteToggle } from "./FavoriteToggle.client";
import type { PhraseDetailViewModel } from "./types";
import styles from "./PhraseDetail.module.scss";

type PhraseDetailContentProps = {
  tripId: string;
  phrase: PhraseDetailViewModel;
};

export function PhraseDetailContent({ tripId, phrase }: PhraseDetailContentProps) {
  return (
    <AppPage width="content">
      <div className={styles.presentation}>
        <div className={styles.headerRow}>
          <p className={styles.categoryLabel}>{phrase.categoryLabel}</p>
          <FavoriteToggle
            tripId={tripId}
            phraseId={phrase.id}
            initialIsFavorite={phrase.isFavorite}
          />
        </div>

        <p className={styles.targetText} lang="ja" dir="ltr">
          {phrase.targetText}
        </p>

        {phrase.pronunciationSource ? (
          <p className={styles.pronunciationSource} dir="rtl">
            {phrase.pronunciationSource}
          </p>
        ) : null}

        {phrase.pronunciationLatin ? (
          <p className={styles.pronunciationLatin} dir="ltr">
            {phrase.pronunciationLatin}
          </p>
        ) : null}

        <p className={styles.sourceText} dir="auto">
          {phrase.sourceText}
        </p>
      </div>
    </AppPage>
  );
}
