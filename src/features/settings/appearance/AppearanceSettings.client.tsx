"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconBack } from "@/components/ui/icons";
import { buildSettingsHubHref } from "@/features/settings/constants";
import type { TripThemeKey } from "@/features/trips/theme";
import { updateTripThemeAction } from "@/features/trips/theme/update-trip-theme-action";
import { updateTripThemeActionInitialState } from "@/features/trips/theme/update-trip-theme-action-state";
import styles from "./AppearanceSettings.module.scss";

type SelectableTheme = {
  key: TripThemeKey;
  nameMessageKey: string;
  descriptionMessageKey: string;
};

type AppearanceSettingsClientProps = {
  tripId: string;
  isOwner: boolean;
  persistedThemeKey: TripThemeKey;
  persistedThemeSelectable: boolean;
  selectableThemes: readonly SelectableTheme[];
};

export function AppearanceSettingsClient({
  tripId,
  isOwner,
  persistedThemeKey,
  persistedThemeSelectable,
  selectableThemes,
}: AppearanceSettingsClientProps) {
  const t = useTranslations("TripTheme");
  const tSettings = useTranslations("Settings");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialDraft = useMemo(() => {
    if (selectableThemes.some((theme) => theme.key === persistedThemeKey)) {
      return persistedThemeKey;
    }
    return null;
  }, [persistedThemeKey, selectableThemes]);

  const [draftThemeKey, setDraftThemeKey] = useState<TripThemeKey | null>(
    initialDraft,
  );
  const [state, dispatch] = useActionState(
    updateTripThemeAction,
    updateTripThemeActionInitialState,
  );

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [state.ok, router]);

  const hasChanges =
    draftThemeKey !== null && draftThemeKey !== persistedThemeKey;
  const canSave = isOwner && hasChanges && !isPending;

  function handleSave() {
    if (!draftThemeKey || !canSave) {
      return;
    }
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("themeKey", draftThemeKey);
    startTransition(() => {
      dispatch(formData);
    });
  }

  const persistedName = t(`themes.${persistedThemeKey}.name`);

  return (
    <div className={styles.page}>
      <Link href={buildSettingsHubHref(tripId)} className={styles.back}>
        <IconBack className={styles.backIcon} aria-hidden />
        <span>{tSettings("backToHub")}</span>
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>{t("pageTitle")}</h1>
        <p className={styles.lead}>{t("pageDescription")}</p>
      </header>

      <section className={styles.currentSection} aria-labelledby="current-theme-label">
        <h2 id="current-theme-label" className={styles.sectionLabel}>
          {t("currentThemeLabel")}
        </h2>
        <p className={styles.currentThemeName}>{persistedName}</p>
        {!persistedThemeSelectable ? (
          <p className={styles.storedNotice} role="status">
            {t("storedThemeUnavailableVisual")}
          </p>
        ) : null}
      </section>

      {isOwner ? (
        <>
          <section aria-labelledby="theme-choices-label">
            <h2 id="theme-choices-label" className={styles.sectionLabel}>
              {t("choicesSectionTitle")}
            </h2>
            <p className={styles.sectionHint}>{t("choicesSectionHint")}</p>

            <div
              className={styles.choiceGrid}
              role="radiogroup"
              aria-labelledby="theme-choices-label"
            >
              {selectableThemes.map((theme) => {
                const selected = draftThemeKey === theme.key;
                const name = t(theme.nameMessageKey);
                const description = t(theme.descriptionMessageKey);
                return (
                  <button
                    key={theme.key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={
                      selected
                        ? `${styles.choiceCard} ${styles.choiceCardSelected}`
                        : styles.choiceCard
                    }
                    onClick={() => setDraftThemeKey(theme.key)}
                    disabled={isPending}
                  >
                    <span className={styles.choiceCheck} aria-hidden>
                      {selected ? "●" : "○"}
                    </span>
                    <span className={styles.choiceCopy}>
                      <span className={styles.choiceTitle}>{name}</span>
                      <span className={styles.choiceDescription}>{description}</span>
                    </span>
                    <ThemePreviewCard themeKey={theme.key} />
                  </button>
                );
              })}
            </div>
          </section>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSave}
              disabled={!canSave}
            >
              {isPending ? t("saving") : t("save")}
            </button>
            {state.ok ? (
              <p className={styles.success} role="status">
                {t("savedSuccess")}
              </p>
            ) : null}
            {state.errorCode ? (
              <p className={styles.error} role="alert">
                {t(`errors.${state.errorCode}`)}
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <section aria-labelledby="member-theme-label">
          <h2 id="member-theme-label" className={styles.sectionLabel}>
            {t("memberSectionTitle")}
          </h2>
          <p className={styles.sectionHint}>{t("memberReadOnlyHint")}</p>
          {persistedThemeSelectable ? (
            <div className={styles.memberPreviewWrap}>
              <ThemePreviewCard themeKey={persistedThemeKey} />
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}

function ThemePreviewCard({ themeKey }: { themeKey: TripThemeKey }) {
  return (
    <div
      className={styles.themePreview}
      data-preview-theme={themeKey}
      aria-hidden
    >
      <div className={styles.previewBackground}>
        <div className={styles.previewSurface}>
          <span className={styles.previewLineStrong} />
          <span className={styles.previewLineMuted} />
          <span className={styles.previewButton} />
        </div>
        <span className={styles.previewNavDot} />
      </div>
    </div>
  );
}
