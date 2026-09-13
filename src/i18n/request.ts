import { getRequestConfig } from "next-intl/server";
import { resolveRequestLocale } from "@/features/i18n/resolve-request-locale";

export default getRequestConfig(async () => {
  const locale = await resolveRequestLocale();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
