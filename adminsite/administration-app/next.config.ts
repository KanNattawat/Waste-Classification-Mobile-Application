import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3-wasteclassification-project.s3.ap-southeast-7.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}
export default nextConfig;
