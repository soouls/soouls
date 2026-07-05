import { useAuth } from '@clerk/clerk-expo';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { LoadingState } from '../components/ui/LoadingState';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';

export function RootNavigator() {
  console.log('[RootNavigator] Rendering');
  const { isLoaded, isSignedIn } = useAuth();
  console.log('[RootNavigator] Auth state:', { isLoaded, isSignedIn });

  if (!isLoaded) {
    console.log('[RootNavigator] Showing LoadingState');
    return <LoadingState message="Starting up..." />;
  }

  console.log('[RootNavigator] Showing Navigators');
  return (
    <NavigationContainer>{isSignedIn ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>
  );
}
