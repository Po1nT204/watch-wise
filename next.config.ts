import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Для Google
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // Для GitHub
      },
    ],
  },
};

export default nextConfig;
