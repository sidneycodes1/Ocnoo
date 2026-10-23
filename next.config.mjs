/** @type {import('next').NextConfig} */
const nextConfig = {
  // The default `X-Powered-By: Next.js` header only tells a scanner which
  // framework to probe.
  poweredByHeader: false,
  // Baseline response headers for the production server. Applied by `next
  // start`; a static export ignores them, so the host must set the same ones
  // there. Deliberately no Content-Security-Policy yet: the seller photo
  // pipeline renders `blob:` object URLs and `data:` avatars, so a CSP needs
  // `img-src 'self' blob: data:` and a wrong policy would blank every image.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            // The app never asks for the camera or mic; the file picker does
            // not need either permission.
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
