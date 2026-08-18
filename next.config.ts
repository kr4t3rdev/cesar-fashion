import type { NextConfig } from "next";

const API_UPSTREAM = process.env.API_UPSTREAM ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_UPSTREAM}/api/v1/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${API_UPSTREAM}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
