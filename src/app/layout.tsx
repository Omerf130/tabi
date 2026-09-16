import type { Metadata, Viewport } from "next";
import { Noto_Sans_Hebrew } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import {
  localeToDirection,
  localeToHtmlLang,
} from "@/features/i18n/locale";
import { resolveRequestLocale } from "@/features/i18n/resolve-request-locale";
import { ConnectivityBanner } from "@/features/pwa/ConnectivityBanner.client";
import { TabiSerwistProvider } from "@/features/pwa/TabiSerwistProvider.client";
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
    appleWebApp: {
      capable: true,
      title: "Tabi",
      statusBarStyle: "black-translucent",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1a2740",
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
        <TabiSerwistProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ConnectivityBanner />
            {children}
          </NextIntlClientProvider>
        </TabiSerwistProvider>
      </body>
    </html>
  );
}
