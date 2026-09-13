import type { AppTranslator } from "@/features/i18n/create-app-translator";
import { getTripDayCount } from "@/features/trips/trip-days";

export type AfterTripSummaryMetric = {
  id: "days" | "activities" | "stays";
  label: string;
  value: string;
};

export function buildAfterTripSummary(
  input: {
    startDate: string;
    endDate: string;
    activityCount: number;
    accommodationCount: number;
  },
  t: AppTranslator<"Home">,
): AfterTripSummaryMetric[] {
  const metrics: AfterTripSummaryMetric[] = [
    {
      id: "days",
      label: t("summaryDays"),
      value: String(getTripDayCount(input.startDate, input.endDate)),
    },
  ];

  if (input.activityCount > 0) {
    metrics.push({
      id: "activities",
      label: t("summaryActivities"),
      value: String(input.activityCount),
    });
  }

  if (input.accommodationCount > 0) {
    metrics.push({
      id: "stays",
      label: t("summaryStays"),
      value: String(input.accommodationCount),
    });
  }

  return metrics;
}
