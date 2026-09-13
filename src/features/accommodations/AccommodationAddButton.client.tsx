"use client";

import Link from "next/link";
import { getAccommodationsSettingsHref } from "./constants";
import styles from "./AccommodationAddButton.module.scss";

type AccommodationAddButtonProps = {
  tripId: string;
};

export function AccommodationAddButton({ tripId }: AccommodationAddButtonProps) {
  return (
    <Link
      href={getAccommodationsSettingsHref(tripId)}
      className={styles.button}
      aria-label="הוספת מקום לינה"
    >
      +
    </Link>
  );
}
