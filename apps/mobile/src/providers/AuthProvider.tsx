import React from 'react';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '../utils/tokenCache';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_Y2xpbWJpbmctbW9sbHktOTEuY2xlcmsuYWNjb3VudHMuZGV2JA';

  if (!publishableKey) {
    throw new Error(
      'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
    );
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}
