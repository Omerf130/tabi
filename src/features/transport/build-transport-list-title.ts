import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { TransportType } from "./transport-types";

export function buildTransportListTitle(
  type: TransportType,
  arrivalLocationName: string,
  t: AppTranslator<"Transport">,
): string {
  const destination = arrivalLocationName.trim();

  switch (type) {
    case "flight":
      return destination
        ? t("listTitles.flight", { destination })
        : t("listTitles.flightNoDestination");
    case "train":
      return destination
        ? t("listTitles.train", { destination })
        : t("listTitles.trainNoDestination");
    case "bus":
      return destination
        ? t("listTitles.bus", { destination })
        : t("listTitles.busNoDestination");
    case "ferry":
      return destination
        ? t("listTitles.ferry", { destination })
        : t("listTitles.ferryNoDestination");
    case "taxi":
      return destination
        ? t("listTitles.taxi", { destination })
        : t("listTitles.taxiNoDestination");
    case "car":
      return destination
        ? t("listTitles.carWithDestination", { destination })
        : t("listTitles.car");
  }
}
