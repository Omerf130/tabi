"use client";

import { useTranslations } from "next-intl";
import {
  formatEntityLinkedCostDisplay,
} from "./entity-linked-cost-presentation";
import type { EntityLinkedCostViewModel } from "./types";

type EntityLinkedCostDisplayProps = {
  linkedCost: EntityLinkedCostViewModel;
};

export function EntityLinkedCostDisplay({ linkedCost }: EntityLinkedCostDisplayProps) {
  const t = useTranslations("Finance");
  return formatEntityLinkedCostDisplay(linkedCost, t("entityCostDisplayPrefix"));
}
