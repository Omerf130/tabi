import type { ComponentType } from "react";
import {
  IconAccommodation,
  IconActivityAttraction,
  IconActivityOther,
  IconActivityRestaurant,
  IconActivityShopping,
  IconPlane,
  IconTrain,
} from "@/components/ui/icons";
import type { ExpenseCategory } from "./types";

export type ExpenseCategoryPresentation = {
  label: string;
  color: string;
  softColor: string;
  Icon: ComponentType<{ className?: string }>;
};

export const EXPENSE_CATEGORY_PRESENTATION: Record<
  ExpenseCategory,
  ExpenseCategoryPresentation
> = {
  accommodation: {
    label: "לינה",
    color: "#2563eb",
    softColor: "rgb(37 99 235 / 12%)",
    Icon: IconAccommodation,
  },
  food: {
    label: "אוכל",
    color: "#ea580c",
    softColor: "rgb(234 88 12 / 12%)",
    Icon: IconActivityRestaurant,
  },
  transport: {
    label: "תחבורה",
    color: "#9333ea",
    softColor: "rgb(147 51 234 / 12%)",
    Icon: IconTrain,
  },
  activities: {
    label: "אטרקציות",
    color: "#16a34a",
    softColor: "rgb(22 163 74 / 12%)",
    Icon: IconActivityAttraction,
  },
  shopping: {
    label: "קניות",
    color: "#db2777",
    softColor: "rgb(219 39 119 / 12%)",
    Icon: IconActivityShopping,
  },
  flights: {
    label: "טיסות",
    color: "#0284c7",
    softColor: "rgb(2 132 199 / 12%)",
    Icon: IconPlane,
  },
  other: {
    label: "אחר",
    color: "#64748b",
    softColor: "rgb(100 116 139 / 12%)",
    Icon: IconActivityOther,
  },
};

export function getExpenseCategoryPresentation(
  category: ExpenseCategory,
): ExpenseCategoryPresentation {
  return EXPENSE_CATEGORY_PRESENTATION[category];
}
