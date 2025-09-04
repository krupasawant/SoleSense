import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nfcrzfkmhxspkeeoyqms.supabase.co', 
      },
    ],
  },
};

export default nextConfig;
