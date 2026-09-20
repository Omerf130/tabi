"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconPlane, IconSearch, IconTrain } from "@/components/ui/icons";
import { CREATE_TRIP_PATH } from "./constants";
import type { MyTripsFilter } from "./filter-my-trips";
import styles from "./MyTripsScreen.module.scss";

type MyTripsEmptyStateProps = {
  filter: MyTripsFilter;
  hasAnyTrips: boolean;
  onShowAllTrips?: () => void;
};

export function MyTripsEmptyState({
  filter,
  hasAnyTrips,
  onShowAllTrips,
}: MyTripsEmptyStateProps) {
  const t = useTranslations(`MyTrips.empty.${filter}`);
  const tReset = useTranslations("MyTrips.empty");

  if (!hasAnyTrips) {
    return (
      <EmptyState
        variant="full"
        className={styles.myTripsEmptyFull}
        visual={{
          motif: "travel",
          icon: <IconTrain aria-hidden />,
          accentIcon: <IconPlane aria-hidden />,
        }}
        title={t("title")}
        description={t("body")}
        primaryAction={{
          label: t("cta"),
          href: CREATE_TRIP_PATH,
        }}
      />
    );
  }

  return (
    <EmptyState
      variant="search"
      className={styles.myTripsEmptySearch}
      visual={{
        motif: "search",
        icon: <IconSearch aria-hidden />,
      }}
      title={t("title")}
      description={t("body")}
      primaryAction={
        filter !== "all" && onShowAllTrips
          ? {
              label: tReset("showAllTrips"),
              onClick: onShowAllTrips,
            }
          : undefined
      }
    />
  );
}
