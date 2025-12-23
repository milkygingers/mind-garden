/**
 * Root Layout
 * 
 * This is the main layout that wraps every page.
 * It sets up fonts, providers, and global metadata.
 */

import type { Metadata } from "next";
import { Outfit, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

// Beautiful, modern fonts
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

// Page metadata (shows in browser tab)
export const metadata: Metadata = {
  title: "Mind Garden - Personal Organization",
  description: "A beautiful personal productivity and knowledge-management app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${playfair.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-[var(--background)]">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

