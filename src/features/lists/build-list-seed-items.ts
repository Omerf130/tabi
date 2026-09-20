import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { DefaultTripListItemTemplate } from "./default-items";
import { resolveListSeedCatalog } from "./list-seed-catalog";

export function buildListSeedItems(
  countryCode: string | undefined | null,
  t: AppTranslator<"Lists">,
): DefaultTripListItemTemplate[] {
  return resolveListSeedCatalog(countryCode).map((entry) => ({
    listType: entry.listType,
    text: t(`seed.${entry.messageKey}` as Parameters<AppTranslator<"Lists">>[0]),
    order: entry.order,
  }));
}
