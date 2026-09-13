import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type {
  TravelDocumentErrorCode,
  TravelDocumentSuccessCode,
} from "./constants";

export function translateDocumentError(
  t: AppTranslator<"Documents">,
  code?: TravelDocumentErrorCode | string,
): string | undefined {
  if (!code) {
    return undefined;
  }

  if (!/^[a-zA-Z]+$/.test(code)) {
    return code;
  }

  return t(`errors.${code as TravelDocumentErrorCode}`);
}

export function translateDocumentSuccess(
  t: AppTranslator<"Documents">,
  code?: TravelDocumentSuccessCode | string,
): string | undefined {
  if (!code) {
    return undefined;
  }

  return t(`errors.${code as TravelDocumentSuccessCode}`);
}
