import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Khmer, Outfit } from "next/font/google";
import "./globals.css";

import { LanguageProvider } from "@/lib/i18n/context";
import { ThemeProvider } from "@/lib/theme/context";

// Runs before hydration to set data-theme/lang from localStorage, avoiding a
// flash of the wrong theme (and, less critically, the wrong <html lang>).
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("tablesite-theme");var resolved=t==="light"||t==="dark"?t:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",resolved);var l=localStorage.getItem("tablesite-locale");if(l==="en"||l==="km"){document.documentElement.lang=l;}}catch(e){}})();`;

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
    <html lang="km" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${sans.variable} ${khmer.variable} ${display.variable}`}>
        <LanguageProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
