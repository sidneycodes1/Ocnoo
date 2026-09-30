import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Softer, rounded corners (replaces the old all-zero override).
    borderRadius: {
      none: "0",
      sm: "6px",
      DEFAULT: "8px",
      md: "10px",
      lg: "12px",
      xl: "16px",
      "2xl": "16px",
      "3xl": "24px",
      full: "9999px",
    },
    extend: {
      colors: {
        // Black/white led, one warm accent for CTAs/active states, two greys.
        accent: "#F5A623",
        surface: "#F5F5F5",
        line: "#EAEAEA",
        disabled: "#D9D9D9",
      },
      boxShadow: {
        // Soft, diffused elevation (replaces the old hard-offset shadows).
        soft: "0 2px 8px rgba(0,0,0,0.08)",
        "soft-hover": "0 4px 16px rgba(0,0,0,0.12)",
      },
      fontFamily: {
        // Sharp geometric sans for all headings/body.
        sans: [
          "system-ui",
          "-apple-system",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        // Monospace for EVERY price on the site.
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      keyframes: {
        // Opacity-only on purpose: animating `transform` here (with fill-mode:
        // both) would leave a non-none transform on the wrapper, which makes it
        // the containing block for any position:fixed child (e.g. the mobile
        // sticky Add-to-Cart bar) and stops it pinning to the viewport.
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
