import { getTripDayCount } from "@/features/trips/trip-days";

export type AfterTripSummaryMetric = {
  id: "days" | "activities" | "stays";
  label: string;
  value: string;
};

export function buildAfterTripSummary(input: {
  startDate: string;
  endDate: string;
  activityCount: number;
  accommodationCount: number;
}): AfterTripSummaryMetric[] {
  const metrics: AfterTripSummaryMetric[] = [
    {
      id: "days",
      label: "ימים",
      value: String(getTripDayCount(input.startDate, input.endDate)),
    },
  ];

  if (input.activityCount > 0) {
    metrics.push({
      id: "activities",
      label: "פעילויות",
      value: String(input.activityCount),
    });
  }

  if (input.accommodationCount > 0) {
    metrics.push({
      id: "stays",
      label: "לינות",
      value: String(input.accommodationCount),
    });
  }

  return metrics;
}
