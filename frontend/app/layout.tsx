import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Khmer, Outfit } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/lib/auth/AuthContext";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans"
});

const khmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-khmer"
});

const display = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "TableSite · Cambodia Restaurant Booking",
  description:
    "Reserve Cambodia's best tables — KHQR deposits, bilingual Khmer/English."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km">
      <body className={`${sans.variable} ${khmer.variable} ${display.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
