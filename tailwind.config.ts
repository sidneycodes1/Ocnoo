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
      // `lg-hover` = desktop AND a real pointing device. Tailwind v3 has no
      // `pointer-fine` variant, so the hover-capability test is baked into a
      // raw screen: without it, a touch tablet at 800px could latch a stuck
      // :hover state on a product card and never release it.
      screens: {
        "lg-hover": { raw: "(hover: hover) and (min-width: 768px)" },
      },
      colors: {
        // ---- Palette swap (Brimble-derived cool-grey family) --------------
        // `black` and `white` are deliberately ALIASES, not literals: they
        // point at the ink and card tones so the whole site re-skins from one
        // place instead of a 110-call-site sweep. Consequence to remember:
        // `text-white` renders as the off-white card tone, which is the
        // intended warm white on charcoal surfaces.
        black: "#1A1C1E", // ink: text + dark-on-light surfaces
        white: "#F7F7F7", // card white

        // Warm accent for FILLS only (badges, step bar, star row, heart).
        accent: "#F5A623",
        // Amber is too light to use as text (#F5A623 on #F7F7F7 is ~1.8:1).
        // This darkened amber carries prices at 5.5:1, which clears WCAG AA.
        "accent-ink": "#8A5A04",
        // Inset/placeholder surfaces: a touch darker than the page canvas.
        surface: "#E9EDEA",
        // Hairlines. Borders are load-bearing here: card (#F7F7F7) on page
        // (#F4F6F5) is only ~3 L* apart, so separation comes from the line.
        line: "#E3E6E4",
        disabled: "#DCE0DD",

        // `primary` was the mobile app-shell blue (#3D5AF1). It is now the
        // charcoal used for filled pills, the active tab and count badges at
        // every width. `charcoal` is the same value under a structural name,
        // for surfaces that are dark blocks rather than controls (footer,
        // feature cards) so intent stays readable at the call site.
        primary: "#212327",
        charcoal: "#212327",
        // Page canvas, both breakpoints.
        page: "#F4F6F5",
        // Pastel fills for the circular brand/model tiles. Names kept from the
        // blue-era palette; the values are re-tinted into this grey-green set.
        "tint-lavender": "#E7EDE9",
        "tint-pink": "#F6E7E4",
        "tint-amber": "#F7EBD5",
        "tint-mint": "#E2F0E7",
        // Destructive actions only (the cart's reveal-to-delete panel).
        danger: "#E5484D",
        // Light-on-dark pair for charcoal surfaces. The rest of the palette is
        // dark-on-light and would be invisible on #212327.
        "on-dark": "#F7F7F7",
        "on-dark-muted": "#8A8F98",
      },
      boxShadow: {
        // Soft, diffused elevation. Tinted to the ink colour rather than pure
        // black, so shadows sit under the cool-grey palette instead of fighting it.
        soft: "0 2px 8px rgba(26,28,30,0.08)",
        "soft-hover": "0 4px 16px rgba(26,28,30,0.12)",
        // The desktop product-card lift (see the hover-lift utility).
        lift: "0 18px 24px rgba(26,28,30,0.14)",
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
        // The product sheet's slide lives in globals.css as a plain @keyframes.
        // Not a theme animation: this route is only reachable through the lazy
        // `@modal` intercept, and dev-mode Tailwind builds its candidate list
        // from the graph of the route being compiled, so the utility kept
        // appearing in one build and vanishing in the next.
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
