import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    API_GATEWAY_URL: process.env.API_GATEWAY_URL,
    API_ACADEMIC_URL: process.env.API_ACADEMIC_URL,
    API_FACULTY_URL: process.env.API_FACULTY_URL,
  },
  async rewrites() {
    const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:5000';
    return [
      {
        source: "/api/faculty/it/:path*",
        destination: `${apiGatewayUrl}/faculty/it/:path*`,
      },
      {
        source: "/api/faculty/tel/:path*",
        destination: `${apiGatewayUrl}/faculty/tel/:path*`,
      },
      {
        source: "/api/academic/:path*",
        destination: `${apiGatewayUrl}/academic/:path*`,
      },
      {
        source: "/api/gateway/:path*",
        destination: `${apiGatewayUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
