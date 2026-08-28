import type { Metadata } from "next";
import { Fraunces, Outfit, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { PWARegister } from "@/components/pwa-register";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#2f5d44",
};

export const metadata: Metadata = {
  title: "yourstory.kp — Manajemen Rental",
  description: "Sistem manajemen rental: inventaris, booking, konsinyasi.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

import { db } from "@/lib/db";
import { settings } from "@/db/schema";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const storeSettings = await db.select().from(settings).limit(1);
  const bgUrl = storeSettings[0]?.backgroundUrl || "/beautiful-view.jpg";

  return (
    <html
      lang="id"
      className={`${outfit.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <style dangerouslySetInnerHTML={{ __html: `
          body::before { background-image: url('${bgUrl}'); }
        `}} />
        {children}
        <Toaster richColors position="top-center" />
        <PWARegister />
      </body>
    </html>
  );
}
