"use client";

import { useTranslations } from "next-intl";
import {
  IconAccommodation,
  IconActivityAttraction,
  IconActivityTransport,
  IconBell,
  IconChevron,
  IconCurrency,
  IconDocuments,
} from "@/components/ui/icons";
import { getQuickAddMenuOptions } from "./quick-add-menu";
import type { QuickAddAction } from "./types";
import styles from "./QuickAdd.module.scss";

const MENU_ICONS = {
  activity: IconActivityAttraction,
  accommodation: IconAccommodation,
  transport: IconActivityTransport,
  reminder: IconBell,
  expense: IconCurrency,
  document: IconDocuments,
} as const satisfies Record<QuickAddAction, typeof IconBell>;

type QuickAddMenuProps = {
  role: "owner" | "member";
  onSelect: (action: QuickAddAction) => void;
};

export function QuickAddMenu({ role, onSelect }: QuickAddMenuProps) {
  const t = useTranslations("QuickAdd");
  const options = getQuickAddMenuOptions(t, role);

  return (
    <div className={styles.menuBody}>
      <p className={styles.menuSubtitle}>{t("menuSubtitle")}</p>
      <ul className={styles.menuList}>
        {options.map((option) => {
          const Icon = MENU_ICONS[option.id];
          return (
            <li key={option.id}>
              <button
                type="button"
                className={styles.menuRow}
                onClick={() => onSelect(option.id)}
              >
                <span className={styles.menuIconWrap} data-kind={option.id}>
                  <Icon className={styles.menuIcon} aria-hidden />
                </span>
                <span className={styles.menuText}>
                  <span className={styles.menuLabel}>{option.label}</span>
                  <span className={styles.menuDescription}>{option.description}</span>
                </span>
                <IconChevron className={styles.menuChevron} aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
