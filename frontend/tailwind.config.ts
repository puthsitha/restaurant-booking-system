import type { Config } from "tailwindcss";

// Design tokens mirror frontend/lib/theme.ts and frontend/app/globals.css,
// which are derived from design/TableSite.reference.html.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        accent: "#C2410C",
        secondary: "#1F6F54",
        bg: "#FBF7F2",
        surface: "#FFFFFF",
        border: "#ECE1D5",
        ink: "#241D19",
        muted: "#9A8E82"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "var(--font-khmer)", "sans-serif"],
        khmer: ["var(--font-khmer)", "var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "var(--font-khmer)", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
