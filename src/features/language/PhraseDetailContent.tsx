import { getTranslations } from "next-intl/server";
import { AppPage } from "@/features/app-shell/AppPage";
import { FavoriteToggle } from "./FavoriteToggle.client";
import type { PhraseDetailViewModel } from "./types";
import styles from "./PhraseDetail.module.scss";

type PhraseDetailContentProps = {
  tripId: string;
  phrase: PhraseDetailViewModel;
};

export async function PhraseDetailContent({ tripId, phrase }: PhraseDetailContentProps) {
  const t = await getTranslations("Language");

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

        <p
          className={styles.targetText}
          lang={phrase.targetLanguage ?? undefined}
          dir={phrase.targetLanguageDirection}
        >
          {phrase.targetText}
        </p>

        {phrase.transliterationLatin ? (
          <>
            <p className={styles.pronunciationLatinLabel}>{t("runtime.pronunciationLatinLabel")}</p>
            <p className={styles.pronunciationLatin} dir="ltr">
              {phrase.transliterationLatin}
            </p>
          </>
        ) : null}

        <p className={styles.sourceText} dir="auto">
          {phrase.sourceText}
        </p>
      </div>
    </AppPage>
  );
}
