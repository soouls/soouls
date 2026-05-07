import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.BACKEND_URL ?? 'http://localhost:3000';
const monorepoRoot = realpathSync.native(fileURLToPath(new URL('../../', import.meta.url)));

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ['@soouls/ui-kit', '@soouls/api', '@soouls/logic'],
  turbopack: {
    root: monorepoRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    const isVercel = process.env.VERCEL === '1';

    // In local dev, we proxy to the absolute backendUrl (usually localhost:3000)
    // In Vercel, we use the internal service route /_/backend defined in vercel.json
    const destination = isVercel
      ? '/_/backend/trpc/:path*'
      : `${backendUrl.replace(/\/$/, '')}/trpc/:path*`;

    return [
      {
        source: '/trpc/:path*',
        destination,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/videos/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Accept-Ranges', value: 'bytes' },
        ],
      },
    ];
  },
};

import { withSentryConfig } from '@sentry/nextjs';

export default withSentryConfig(nextConfig, {
  org: 'soouls',
  project: 'frontend',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
});
