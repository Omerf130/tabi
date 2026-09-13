"use client";

import Link from "next/link";
import {
  CREATE_TRIP_PATH,
  MY_TRIPS_FILTER_LABELS,
} from "./constants";
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
  return (
    <div className={styles.filterBar}>
      <div
        className={styles.filterGroup}
        role="group"
        aria-label="Trip filters"
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
              {MY_TRIPS_FILTER_LABELS[filter]}
            </button>
          );
        })}
      </div>

      <Link
        href={CREATE_TRIP_PATH}
        className={styles.createTripButton}
        aria-label="Create new trip"
      >
        <span className={styles.createTripIcon} aria-hidden="true">
          +
        </span>
      </Link>
    </div>
  );
}
