"use client";

import {
  IconActivityAttraction,
  IconActivityHotel,
  IconActivityTransport,
  IconCalendar,
  IconChevron,
  IconDocuments,
} from "@/components/ui/icons";
import { DAY_ADD_MENU_OPTIONS } from "./day-action-menu";
import type { DayAddMenuAction } from "./day-action-surface.types";
import styles from "./AddItemFlow.module.scss";

const CHOOSER_ICONS = {
  activity: IconActivityAttraction,
  transport: IconActivityTransport,
  accommodation: IconActivityHotel,
  reminder: IconCalendar,
  document: IconDocuments,
} as const;

type DayAddItemChooserProps = {
  onSelect: (action: DayAddMenuAction) => void;
};

export function DayAddItemChooser({ onSelect }: DayAddItemChooserProps) {
  return (
    <ul className={styles.chooserList}>
      {DAY_ADD_MENU_OPTIONS.map((option) => {
        const Icon = CHOOSER_ICONS[option.id];
        return (
          <li key={option.id}>
            <button
              type="button"
              className={styles.chooserCard}
              onClick={() => onSelect(option.id)}
            >
              <span className={styles.chooserIconWrap} data-kind={option.id}>
                <Icon className={styles.chooserIcon} aria-hidden />
              </span>
              <span className={styles.chooserText}>
                <span className={styles.chooserTitle}>{option.label}</span>
                <span className={styles.chooserDescription}>{option.description}</span>
              </span>
              <IconChevron className={styles.chooserChevron} aria-hidden />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
