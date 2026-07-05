import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/providers/AuthProvider';
import { TRPCProvider } from './src/providers/TRPCProvider';

export default function App() {
  console.log('[App] Rendering App');
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TRPCProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </TRPCProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
