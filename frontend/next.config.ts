import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      // Backend server images (attendance scan photos)
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "192.168.0.134" },
      // Placeholder fallback
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },
};

export default nextConfig;
