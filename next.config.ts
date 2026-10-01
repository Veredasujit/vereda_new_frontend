import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Optional modern formats, fallback to original handled automatically
    formats: ["image/avif", "image/webp"],

    // Optional: allow your domain (if hosting images there)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vereda.co.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.vereda.co.in",
        pathname: "/**",
      },
    ],

    // Important: disable Next.js optimization for external images
    unoptimized: true,
  },
};

export default nextConfig;
