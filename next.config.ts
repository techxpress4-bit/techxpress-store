import type { NextConfig } from "next";

// Note : output: 'export' (Cloudflare Pages statique) — les headers HTTP sont
// servis par Cloudflare Pages via le fichier `public/_headers`, pas via
// `next.config`. Voir public/_headers pour CSP / X-Frame-Options / etc.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
