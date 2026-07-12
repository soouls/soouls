import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import { AuthNavigator } from './AuthNavigator';
import { LoadingState } from '../components/ui/LoadingState';
import { AppNavigator } from './AppNavigator';

export function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <LoadingState message="Starting up..." />;
  }

  return (
    <NavigationContainer>
      {isSignedIn ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}


