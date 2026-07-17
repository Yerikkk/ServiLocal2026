import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/services", destination: "/servicios", permanent: true },
      { source: "/services/:path*", destination: "/servicios/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
