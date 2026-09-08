import type { Metadata, Viewport } from "next";
import { Noto_Sans_Hebrew } from "next/font/google";
import "@/styles/globals.scss";

const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ui",
});

export const metadata: Metadata = {
  title: "Tabi",
  description: "תכנון וניהול טיולים",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      data-color-scheme="light"
      className={notoSansHebrew.variable}
    >
      <body>{children}</body>
    </html>
  );
}
