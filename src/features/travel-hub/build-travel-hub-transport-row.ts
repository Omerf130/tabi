import { buildTransportHref } from "@/features/transport/constants";
import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { TransportRecord } from "@/features/transport/types";
import type { TravelHubPrimaryToolRow } from "./types";

type BuildTravelHubTransportRowInput = {
  tripId: string;
  transports: readonly TransportRecord[];
  t: AppTranslator<"TravelHub">;
};

export function buildTravelHubTransportRow({
  tripId,
  transports,
  t,
}: BuildTravelHubTransportRowInput): TravelHubPrimaryToolRow {
  const count = transports.length;
  const countLabel =
    count === 0
      ? null
      : count === 1
        ? t("transportCountOne")
        : t("transportCountMany", { count });

  return {
    href: buildTransportHref(tripId),
    title: t("transportTitle"),
    countLabel,
    detailLine: null,
    emptyLine: count === 0 ? t("transportEmpty") : null,
  };
}
