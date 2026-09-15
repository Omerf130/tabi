"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuickAdd } from "@/features/quick-add/QuickAddProvider.client";
import styles from "./AccommodationAddButton.module.scss";

export function AccommodationAddButton() {
  const t = useTranslations("Accommodation");
  const pathname = usePathname();
  const { open } = useQuickAdd();

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={t("addButtonAria")}
      onClick={() =>
        open({
          context: { originPath: pathname },
          initialStep: { kind: "form", action: "accommodation" },
        })
      }
    >
      +
    </button>
  );
}
