'use client';

import * as Sentry from '@sentry/nextjs';
import NextErrorPage from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <NextErrorPage statusCode={500} title="Soouls experienced an unexpected error." />
      </body>
    </html>
  );
}
