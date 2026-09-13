"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import {
  IconBus,
  IconCar,
  IconFerry,
  IconPlane,
  IconTaxi,
  IconTrain,
} from "@/components/ui/icons";
import { buildTransportNewHref, getAddTransportTypeLabel } from "./constants";
import {
  TRANSPORT_TYPES,
  type TransportType,
} from "./transport-types";
import styles from "./TransportAddMenu.module.scss";

const TRANSPORT_MENU_ICONS: Record<TransportType, typeof IconPlane> = {
  flight: IconPlane,
  train: IconTrain,
  bus: IconBus,
  ferry: IconFerry,
  car: IconCar,
  taxi: IconTaxi,
};

type TransportAddMenuProps = {
  tripId: string;
  variant?: "header" | "embedded";
};

export function TransportAddMenu({ tripId, variant = "header" }: TransportAddMenuProps) {
  const t = useTranslations("Transport");
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-variant={variant}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-label={t("addMenuAria")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        +
      </button>

      {open ? (
        <div id={menuId} className={styles.menu} role="menu" aria-label={t("addMenuTypeAria")}>
          <ul className={styles.menuList}>
            {TRANSPORT_TYPES.map((type) => {
              const Icon = TRANSPORT_MENU_ICONS[type];
              return (
                <li key={type}>
                  <Link
                    href={buildTransportNewHref(tripId, type)}
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    <Icon className={styles.menuIcon} aria-hidden />
                    <span>{getAddTransportTypeLabel(type, t)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
