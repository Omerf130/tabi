"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { getAccommodationsSettingsHref } from "./constants";
import styles from "./AccommodationAddButton.module.scss";

type AccommodationAddButtonProps = {
  tripId: string;
};

export function AccommodationAddButton({ tripId }: AccommodationAddButtonProps) {
  const t = useTranslations("Accommodation");

  return (
    <Link
      href={getAccommodationsSettingsHref(tripId)}
      className={styles.button}
      aria-label={t("addButtonAria")}
    >
      +
    </Link>
  );
}
