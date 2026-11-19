import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: isProd ? "export" : "standalone",
  trailingSlash: true,
  turbopack: { root: process.cwd() },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cbu01.alicdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.nike.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;