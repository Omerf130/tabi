import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { AccommodationErrorCode, AccommodationSuccessCode } from "./constants";

export function translateAccommodationError(
  t: AppTranslator<"Accommodation">,
  code?: AccommodationErrorCode | string,
): string | undefined {
  if (!code) {
    return undefined;
  }

  if (!/^[a-zA-Z]+$/.test(code)) {
    return code;
  }

  return t(`errors.${code as AccommodationErrorCode}`);
}

export function translateAccommodationSuccess(
  t: AppTranslator<"Accommodation">,
  code?: AccommodationSuccessCode | string,
): string | undefined {
  if (!code) {
    return undefined;
  }

  return t(`errors.${code as AccommodationSuccessCode}`);
}
