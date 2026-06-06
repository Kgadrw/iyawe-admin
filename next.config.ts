import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || 'https://iyawe-backend.onrender.com'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ]
  },
};

export default nextConfig;
