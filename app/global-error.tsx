"use client";

/**
 * Catches errors in the root layout itself — a font that fails to load, a
 * provider that throws, a catalogue read that dies before any page renders.
 *
 * It has to render its own `<html>` and `<body>` because the real layout is the
 * thing that broke, and it deliberately uses plain markup and inline styles:
 * pulling in shared components here would re-run the code that just failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#F2F4F3" }}>
        <div
          style={{
            maxWidth: 560,
            margin: "0 auto",
            padding: "80px 20px",
            textAlign: "center",
            fontFamily: "Arial, Helvetica, sans-serif",
            color: "#111312",
          }}
        >
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>OCNOO</p>
          <h1 style={{ margin: "18px 0 0", fontSize: 26, fontWeight: 800, textTransform: "uppercase" }}>
            The shop could not open
          </h1>
          <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.6, color: "#3C403D" }}>
            Something went wrong before the page could draw. Reloading usually
            fixes it. If it does not, the shop is still reachable by phone.
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#111312",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 10,
                padding: "13px 22px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reload the shop
            </button>
            <a
              href="tel:+2348138855603"
              style={{
                background: "#FFFFFF",
                color: "#111312",
                border: "1px solid #E4E7E5",
                borderRadius: 10,
                padding: "13px 22px",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Call the shop
            </a>
          </div>
          {error?.digest && (
            <p style={{ marginTop: 18, fontSize: 11, color: "#8B8F8D", fontFamily: "monospace" }}>
              Reference {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
