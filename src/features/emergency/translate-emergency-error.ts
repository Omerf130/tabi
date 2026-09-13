import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { EmergencyErrorCode } from "./constants";

export function translateEmergencyError(
  t: AppTranslator<"Emergency">,
  code?: EmergencyErrorCode | string,
): string | undefined {
  if (!code) {
    return undefined;
  }

  if (code === "validationFailed") {
    return t("errors.validationFailed");
  }

  if (code === "notFound") {
    return t("errors.notFound");
  }

  return code;
}
