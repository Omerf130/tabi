import type { Metadata, Viewport } from "next";
import { Noto_Sans_Hebrew } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import {
  localeToDirection,
  localeToHtmlLang,
} from "@/features/i18n/locale";
import { resolveRequestLocale } from "@/features/i18n/resolve-request-locale";
import "@/styles/globals.scss";

const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ui",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Welcome");

  return {
    title: {
      default: "Tabi",
      template: "%s · Tabi",
    },
    description: t("metadataDescription"),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await resolveRequestLocale();
  const messages = await getMessages();
  const dir = localeToDirection(locale);

  return (
    <html
      lang={localeToHtmlLang(locale)}
      dir={dir}
      data-color-scheme="light"
      className={notoSansHebrew.variable}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
