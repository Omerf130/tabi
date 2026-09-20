import type { AppTranslator } from "@/features/i18n/create-app-translator";
import { resolvePhraseIntentMessageKey } from "./phrase-intent-message-key";

/** Localized source phrase shown to the traveler (UI locale — not Azure anchor). */
export function getPhraseIntentUiSourceText(
  phraseIntentId: string,
  t: AppTranslator<"Language">,
): string {
  const messageKey = resolvePhraseIntentMessageKey(phraseIntentId);
  return t(messageKey as Parameters<typeof t>[0]);
}
