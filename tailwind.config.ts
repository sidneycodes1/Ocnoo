import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Hard corners everywhere: override ALL default radii to 0.
    borderRadius: {
      none: "0",
      sm: "0",
      DEFAULT: "0",
      md: "0",
      lg: "0",
      xl: "0",
      "2xl": "0",
      "3xl": "0",
      full: "0",
    },
    extend: {
      colors: {
        // Pure black/white are the only "real" colors; grey is disabled-only.
        disabled: "#D9D9D9",
      },
      boxShadow: {
        // Signature hard, zero-blur offset shadows.
        hard: "4px 4px 0px #000000",
        "hard-hover": "6px 6px 0px #000000",
        "hard-press": "0px 0px 0px #000000",
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
