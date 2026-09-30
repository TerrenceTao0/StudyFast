import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API calls through this domain so the auth cookie is first-party.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
