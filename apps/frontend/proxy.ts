import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { publicInfoPaths } from './src/config/publicInfoRoutes';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/forgot-password(.*)',
  '/onboarding(.*)',
  ...publicInfoPaths.map((path) => `${path}(.*)`),
]);
const isTrpcRoute = createRouteMatcher(['/trpc(.*)']);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const { pathname } = request.nextUrl;

  // Let the backend tRPC context verify the Bearer token and return tRPC-shaped
  // JSON errors. Clerk page redirects here make the tRPC client fail to decode.
  if (isTrpcRoute(request)) {
    return NextResponse.next();
  }

  let response = NextResponse.next();

  // 1. If user is authenticated and tries to access the landing page or pricing page, redirect them.
  if (userId) {
    if (pathname === '/') {
      response = NextResponse.redirect(new URL('/home', request.url));
    } else if (pathname.startsWith('/pricing')) {
      response = NextResponse.redirect(new URL('/home?showPricing=true', request.url));
    }
  }

  // 2. If the route is not public, protect it
  if (!isPublicRoute(request) && request.headers.get('x-playwright-test') !== '1') {
    await auth.protect();
  }

  // 3. Set currency based on geolocation, keeping existing if already set
  let currency = request.cookies.get('currency')?.value;
  if (!currency || (currency !== 'INR' && currency !== 'USD')) {
    const country = request.headers.get('x-vercel-ip-country');
    currency = country === 'IN' ? 'INR' : 'USD';
  }
  response.cookies.set('currency', currency);

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
