import { type NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
const _backendPrefix =
  process.env.NODE_ENV === 'production' && !process.env.VERCEL
    ? '/_/backend'
    : process.env.VERCEL_BACKEND_PREFIX || '/_/backend';
// Actually, since Next.js proxying /trpc in next.config.js uses `backendUrl.replace(/\/$/, '')`, let's just do that:
const normalizedBackendUrl = backendUrl.replace(/\/$/, '');
const isVercel = process.env.VERCEL === '1';
const usesStandaloneBackend = !normalizedBackendUrl.endsWith('/_/backend');

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  const pathString = resolvedParams.path.join('/');
  // Calculate destination similar to next.config.js
  const destination =
    isVercel && !usesStandaloneBackend
      ? `/_/backend/payments/${pathString}`
      : `${normalizedBackendUrl}${usesStandaloneBackend ? '' : '/_/backend'}/payments/${pathString}`;

  // Forward the request
  try {
    const body = await req.text();
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      if (
        ['authorization', 'content-type', 'x-masquerade-session', 'x-clerk-authorization'].includes(
          key.toLowerCase(),
        )
      ) {
        headers.set(key, value);
      }
    });

    const targetUrl = destination.startsWith('http')
      ? destination
      : `http://localhost:3000${destination}`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body,
    });

    const responseBody = await response.text();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
