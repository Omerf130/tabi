"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconItinerary } from "@/components/ui/icons";
import styles from "./TripHomeContent.module.scss";

type TodaysPlanEmptyProps = {
  ctaHref: string;
};

export function TodaysPlanEmpty({ ctaHref }: TodaysPlanEmptyProps) {
  const t = useTranslations("Home");

  return (
    <EmptyState
      variant="section"
      visualDensity="compact"
      className={styles.todaysPlanEmpty}
      visual={{
        motif: "generic",
        icon: <IconItinerary aria-hidden />,
      }}
      title={t("todaysPlanEmptyTitle")}
      description={t("todaysPlanEmptyHint")}
      primaryAction={{
        label: t("todaysPlanEmptyCta"),
        href: ctaHref,
      }}
    />
  );
}
