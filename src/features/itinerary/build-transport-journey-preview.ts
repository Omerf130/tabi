export type TransportJourneyPreviewInput = {
  departureLocationName?: string;
  arrivalLocationName?: string;
  departureTime?: string;
  arrivalTime?: string;
};

export function buildTransportJourneyPreview(
  input: TransportJourneyPreviewInput,
): { routeLabel: string; timeLabel?: string } | null {
  const from = input.departureLocationName?.trim();
  const to = input.arrivalLocationName?.trim();

  if (!from || !to) {
    return null;
  }

  const departureTime = input.departureTime?.trim();
  const arrivalTime = input.arrivalTime?.trim();
  const timeLabel =
    departureTime && arrivalTime
      ? `${departureTime} → ${arrivalTime}`
      : departureTime || arrivalTime || undefined;

  return {
    routeLabel: `${from} → ${to}`,
    timeLabel,
  };
}
