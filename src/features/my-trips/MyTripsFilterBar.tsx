"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CREATE_TRIP_PATH } from "./constants";
import type { MyTripsFilter } from "./filter-my-trips";
import { MY_TRIPS_FILTERS } from "./filter-my-trips";
import styles from "./MyTripsScreen.module.scss";

type MyTripsFilterBarProps = {
  activeFilter: MyTripsFilter;
  onFilterChange: (filter: MyTripsFilter) => void;
};

export function MyTripsFilterBar({
  activeFilter,
  onFilterChange,
}: MyTripsFilterBarProps) {
  const t = useTranslations("MyTrips.filters");
  const tCreate = useTranslations("MyTrips.createTrip");

  return (
    <div className={styles.filterBar}>
      <div
        className={styles.filterGroup}
        role="group"
        aria-label={t("ariaLabel")}
      >
        {MY_TRIPS_FILTERS.map((filter) => {
          const isSelected = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              className={isSelected ? styles.filterPillActive : styles.filterPill}
              aria-pressed={isSelected}
              onClick={() => onFilterChange(filter)}
            >
              {t(filter)}
            </button>
          );
        })}
      </div>

      <Link
        href={CREATE_TRIP_PATH}
        className={styles.createTripButton}
        aria-label={tCreate("ariaLabel")}
      >
        <span className={styles.createTripIcon} aria-hidden="true">
          +
        </span>
      </Link>
    </div>
  );
}
