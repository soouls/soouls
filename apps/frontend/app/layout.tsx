import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { TRPCProvider } from '../src/providers/trpc-provider';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'SoulCanvas - Your Life Journal',
  description: 'A beautiful 3D journaling experience',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <TRPCProvider>{children}</TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
