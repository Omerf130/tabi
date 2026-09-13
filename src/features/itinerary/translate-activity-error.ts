import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { ActivityErrorCode } from "./constants";

export function translateActivityError(
  t: AppTranslator<"Activity">,
  code?: string,
): string | undefined {
  if (!code) {
    return undefined;
  }

  if (!/^[a-zA-Z]+$/.test(code)) {
    return code;
  }

  return t(`errors.${code as ActivityErrorCode}`);
}
