import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { CSPostHogProvider } from '../src/providers/posthog-provider';
import { PersistedTRPCProvider } from '../src/providers/trpc-provider';
import { UiThemeProvider } from '../src/providers/ui-theme-provider';
import { GlobalMascot } from './components/GlobalMascot';
import PageTransition from './transition';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

const playfair = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-playfair',
});

const urbanist = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-urbanist',
});

export const metadata: Metadata = {
  title: 'Soouls — A quieter way to think',
  description:
    'Non-linear journaling designed for depth. Capture your thoughts as they happen. Build a map of your mind.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${urbanist.variable} font-urbanist`}
          suppressHydrationWarning
        >
          <CSPostHogProvider>
            <PersistedTRPCProvider>
              <UiThemeProvider>
                <PageTransition>
                  {children}
                </PageTransition>
              </UiThemeProvider>
            </PersistedTRPCProvider>
            <GlobalMascot />
            <Analytics />
            <SpeedInsights />
          </CSPostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
