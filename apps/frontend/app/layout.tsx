import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Playfair_Display, Urbanist } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { CSPostHogProvider } from '../src/providers/posthog-provider';
import { PersistedTRPCProvider } from '../src/providers/trpc-provider';
import { UiThemeProvider } from '../src/providers/ui-theme-provider';
import { BackgroundText } from './components/BackgroundText';
import { GlobalMascot } from './components/GlobalMascot';

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

const urbanist = Urbanist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-urbanist',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
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
          className={`${geistMono.variable} ${urbanist.variable} ${playfair.variable} font-urbanist`}
          suppressHydrationWarning
        >
          <CSPostHogProvider>
            <PersistedTRPCProvider>
              <UiThemeProvider>
                {children}
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
