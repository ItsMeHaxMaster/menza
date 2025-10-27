import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-canteen.kenderesi.hu',
        pathname: '/images/**'
      }
    ]
  }
};

export default nextConfig;
