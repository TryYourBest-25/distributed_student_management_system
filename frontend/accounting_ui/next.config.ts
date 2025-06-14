import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:14100/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
