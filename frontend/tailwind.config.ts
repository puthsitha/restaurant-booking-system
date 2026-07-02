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
      },
      keyframes: {
        "ts-orbit": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        "ts-steam": {
          "0%": { transform: "translateY(0) scaleY(0.7)", opacity: "0" },
          "30%": { opacity: "0.9" },
          "100%": { transform: "translateY(-16px) scaleY(1.15)", opacity: "0" }
        },
        "ts-shimmer": {
          "0%": { backgroundPosition: "-468px 0" },
          "100%": { backgroundPosition: "468px 0" }
        },
        "ts-bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        },
        "ts-pop-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "ts-jiggle": {
          "0%, 100%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(4deg)" }
        }
      },
      animation: {
        "ts-orbit": "ts-orbit 1.6s linear infinite",
        "ts-steam": "ts-steam 1.8s ease-in-out infinite",
        "ts-shimmer": "ts-shimmer 1.6s ease-in-out infinite",
        "ts-bounce-soft": "ts-bounce-soft 2s ease-in-out infinite",
        "ts-pop-in": "ts-pop-in 0.3s ease-out",
        "ts-jiggle": "ts-jiggle 2.4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
