"use client";

import { useMemo, useState } from "react";
import { filterMyTripsCards, type MyTripsFilter } from "./filter-my-trips";
import { MyTripsEmptyState } from "./MyTripsEmptyState";
import { MyTripsFilterBar } from "./MyTripsFilterBar";
import { TripLibraryGrid } from "./TripLibraryGrid";
import type { MyTripsCardItem } from "./types";
import styles from "./MyTripsScreen.module.scss";

type MyTripsContentProps = {
  trips: MyTripsCardItem[];
};

export function MyTripsContent({ trips }: MyTripsContentProps) {
  const [activeFilter, setActiveFilter] = useState<MyTripsFilter>("all");

  const filteredTrips = useMemo(
    () => filterMyTripsCards(trips, activeFilter),
    [trips, activeFilter],
  );

  return (
    <main className={styles.workspace}>
      <MyTripsFilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {filteredTrips.length > 0 ? (
        <TripLibraryGrid trips={filteredTrips} />
      ) : (
        <MyTripsEmptyState filter={activeFilter} hasAnyTrips={trips.length > 0} />
      )}
    </main>
  );
}
