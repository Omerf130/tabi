export const TRANSPORT_TYPES = [
  "flight",
  "train",
  "bus",
  "ferry",
  "car",
  "taxi",
] as const;

export type TransportType = (typeof TRANSPORT_TYPES)[number];

export const TRAIN_CATEGORIES = [
  "shinkansen",
  "limited_express",
  "reserved",
  "local",
  "other",
] as const;

export type TrainCategory = (typeof TRAIN_CATEGORIES)[number];

export const TRANSPORT_TYPE_LABELS: Record<TransportType, string> = {
  flight: "טיסות",
  train: "רכבות",
  bus: "אוטובוסים",
  ferry: "מעבורות",
  car: "רכב / הסעה",
  taxi: "מוניות",
};

export const TRANSPORT_TYPE_SINGULAR_LABELS: Record<TransportType, string> = {
  flight: "טיסה",
  train: "רכבת",
  bus: "אוטובוס",
  ferry: "מעבורת",
  car: "רכב / הסעה",
  taxi: "מונית",
};

export const TRAIN_CATEGORY_LABELS: Record<TrainCategory, string> = {
  shinkansen: "Shinkansen",
  limited_express: "Limited Express",
  reserved: "רכבת שמורה",
  local: "רכבת מקומית",
  other: "רכבת",
};

export function isTransportType(value: string): value is TransportType {
  return (TRANSPORT_TYPES as readonly string[]).includes(value);
}
