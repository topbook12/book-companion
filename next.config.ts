import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel auto-detects Next.js — no special output config needed. */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  /* Allow server-side imports of our portable JSON data file. */
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
