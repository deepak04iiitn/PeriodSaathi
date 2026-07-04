import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const BOT_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? "https://t.me/periodsaathi_bot";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://periodsaathi.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "PeriodSaathi — Your Cycle, Your Companion",
  description:
    "Private period tracking inside Telegram. Smart reminders, cycle predictions, and full control — no app download, no sign-up required.",
  keywords: [
    "period tracker",
    "menstrual cycle",
    "Telegram bot",
    "period reminder",
    "cycle prediction",
    "women health",
    "PeriodSaathi",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "PeriodSaathi — Your Cycle, Your Companion",
    description:
      "Never miss your period again. Private reminders and smart predictions, all inside Telegram.",
    siteName: "PeriodSaathi",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PeriodSaathi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PeriodSaathi — Your Cycle, Your Companion",
    description:
      "Private period tracking inside Telegram. Smart reminders, no app download required.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col bg-ivory text-plum antialiased font-sans">
        {children}
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="AuXwRgz1dUYJ8MvtuYl4eg"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
