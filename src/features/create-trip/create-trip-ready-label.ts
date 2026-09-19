export function resolveCreateTripReadyTripLabel(input: {
  tripName: string;
  destinationDisplayName?: string;
}): string {
  const name = input.tripName.trim();
  if (name.length >= 2) {
    return name;
  }

  const destination = input.destinationDisplayName?.trim();
  if (destination) {
    return destination;
  }

  return name;
}
