import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { TripCoverErrorCode, TripCoverSuccessCode } from "./constants";

export function translateCoverError(
  t: AppTranslator<"TripCover">,
  code?: TripCoverErrorCode | string,
): string | undefined {
  if (!code) {
    return undefined;
  }

  if (!/^[a-zA-Z]+$/.test(code)) {
    return code;
  }

  return t(`errors.${code as TripCoverErrorCode}`);
}

export function translateCoverSuccess(
  t: AppTranslator<"TripCover">,
  code?: TripCoverSuccessCode | string,
): string | undefined {
  if (!code) {
    return undefined;
  }

  return t(`errors.${code as TripCoverSuccessCode}`);
}
