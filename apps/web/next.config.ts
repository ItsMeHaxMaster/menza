import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-canteen.kenderesi.hu',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
