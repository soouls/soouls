import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

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
};

import { withSentryConfig } from '@sentry/nextjs';

export default withSentryConfig(nextConfig, {
  org: 'soouls',
  project: 'admin-dashboard',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
});
