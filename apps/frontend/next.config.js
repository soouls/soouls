/** @type {import('next').NextConfig} */
const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.BACKEND_URL ?? 'http://localhost:3000';

const nextConfig = {
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
