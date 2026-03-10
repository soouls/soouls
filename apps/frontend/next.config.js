/** @type {import('next').NextConfig} */
const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.BACKEND_URL ?? 'http://localhost:3000';

const nextConfig = {
  compress: true, // Explicitly enable gzip compression
  swcMinify: true, // Enable SWC minification for faster builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async rewrites() {
    return [
      {
        source: '/trpc/:path*',
        destination: `${backendUrl}/trpc/:path*`,
      },
    ];
  },
};

export default nextConfig;
