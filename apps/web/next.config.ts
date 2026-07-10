import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/services", destination: "/servicios", permanent: true },
      { source: "/services/:path*", destination: "/servicios/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
