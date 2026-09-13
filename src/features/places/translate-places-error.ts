import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { PlacesErrorCode } from "./constants";

export function translatePlacesError(
  t: AppTranslator<"Places">,
  code?: PlacesErrorCode | string,
): string | undefined {
  if (!code) {
    return undefined;
  }

  if (!/^[a-zA-Z]+$/.test(code)) {
    return code;
  }

  return t(`errors.${code as PlacesErrorCode}`);
}
