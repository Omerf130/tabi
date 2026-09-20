import type { AppTranslator } from "@/features/i18n/create-app-translator";

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

export function createTransportTypeLabelResolver(t: AppTranslator<"Transport">) {
  return (type: TransportType) => t(`types.${type}`);
}

export function createTransportTypeSingularLabelResolver(
  t: AppTranslator<"Transport">,
) {
  return (type: TransportType) => t(`typesSingular.${type}`);
}

export function isTransportType(value: string): value is TransportType {
  return (TRANSPORT_TYPES as readonly string[]).includes(value);
}
