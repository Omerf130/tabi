import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { MemberErrorCode, MemberSuccessCode } from "./constants";

export function translateMemberError(
  t: AppTranslator<"TripMembers">,
  code?: MemberErrorCode | string,
): string | undefined {
  if (!code) {
    return undefined;
  }

  if (!/^[a-zA-Z]+$/.test(code)) {
    return code;
  }

  return t(`errors.${code as MemberErrorCode}`);
}

export function translateMemberSuccess(
  t: AppTranslator<"TripMembers">,
  code?: MemberSuccessCode | string,
): string | undefined {
  if (!code) {
    return undefined;
  }

  return t(`errors.${code as MemberSuccessCode}`);
}
