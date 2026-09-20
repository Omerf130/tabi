"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconItinerary } from "@/components/ui/icons";
import styles from "./ItineraryPage.module.scss";

type ItineraryOverviewEmptyProps = {
  isOwner: boolean;
  startDayHref: string;
};

export function ItineraryOverviewEmpty({
  isOwner,
  startDayHref,
}: ItineraryOverviewEmptyProps) {
  const t = useTranslations("Itinerary");

  return (
    <EmptyState
      variant="section"
      className={styles.overviewEmpty}
      visual={{
        motif: "generic",
        icon: <IconItinerary aria-hidden />,
      }}
      title={t("overviewEmptyTitle")}
      description={t("overviewEmptyDescription")}
      primaryAction={
        isOwner
          ? {
              label: t("overviewEmptyCta"),
              href: startDayHref,
            }
          : undefined
      }
    />
  );
}
