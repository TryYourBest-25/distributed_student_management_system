import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/academic/:path*",
        destination: `${process.env.API_ACADEMIC_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
