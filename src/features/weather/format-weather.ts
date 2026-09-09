export function formatTemperatureC(value: number): string {
  return `${new Intl.NumberFormat("he-IL", {
    maximumFractionDigits: 0,
  }).format(Math.round(value))}°`;
}

export function formatLocationLabel(
  label: string,
  region: string | undefined,
  country: string,
): string {
  const parts = [label];
  if (region && region !== label) {
    parts.push(region);
  }
  parts.push(country);
  return parts.join(", ");
}

export function formatObservedAt(value: string, locale = "he-IL"): string {
  const parsed = new Date(value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export function formatForecastDayLabel(date: string, locale = "he-IL"): string {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) {
    return date;
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatRainChance(value: number | null): string | null {
  if (value === null) {
    return null;
  }

  return `${value}%`;
}
