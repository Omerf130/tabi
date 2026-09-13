import { createTranslator } from "next-intl";
import enMessages from "../../../messages/en.json";
import heMessages from "../../../messages/he.json";
import type { AppLocale } from "./locale";

const messagesByLocale = {
  he: heMessages,
  en: enMessages,
} as const;

export type MessageNamespace = keyof typeof heMessages;

export function createAppTranslator<N extends MessageNamespace>(
  namespace: N,
  locale: AppLocale = "he",
) {
  return createTranslator({
    locale,
    messages: messagesByLocale[locale],
    namespace,
  });
}

export type AppTranslator<N extends MessageNamespace = MessageNamespace> =
  ReturnType<typeof createAppTranslator<N>>;
