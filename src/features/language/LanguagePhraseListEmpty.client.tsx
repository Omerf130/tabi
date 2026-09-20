"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconDictionary, IconSearch } from "@/components/ui/icons";
import { buildLanguageHref } from "./constants";
import styles from "./LanguagePage.module.scss";

type LanguagePhraseListEmptyProps = {
  tripId: string;
  mode: "search" | "favorites" | "filtered";
  onClearSearch: () => void;
};

export function LanguagePhraseListEmpty({
  tripId,
  mode,
  onClearSearch,
}: LanguagePhraseListEmptyProps) {
  const t = useTranslations("Language.errors");

  if (mode === "search") {
    return (
      <EmptyState
        variant="search"
        className={styles.phraseListEmpty}
        visual={{ motif: "search", icon: <IconSearch aria-hidden /> }}
        title={t("noResults")}
        primaryAction={{
          label: t("clearSearch"),
          onClick: onClearSearch,
        }}
      />
    );
  }

  return (
    <EmptyState
      variant="section"
      visualDensity="compact"
      className={styles.phraseListEmpty}
      visual={{ motif: "generic", icon: <IconDictionary aria-hidden /> }}
      title={mode === "favorites" ? t("noFavorites") : t("noResults")}
      primaryAction={
        mode === "favorites"
          ? {
              label: t("showAll"),
              href: buildLanguageHref(tripId),
            }
          : undefined
      }
    />
  );
}
