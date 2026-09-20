"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconGrid } from "@/components/ui/icons";
import styles from "./ListDetail.module.scss";

export function ListChecklistEmpty() {
  const t = useTranslations("Lists");

  return (
    <EmptyState
      variant="section"
      visualDensity="compact"
      className={styles.listEmptyState}
      visual={{ motif: "generic", icon: <IconGrid aria-hidden /> }}
      title={t("emptyListTitle")}
      description={t("emptyListDescription")}
    />
  );
}
