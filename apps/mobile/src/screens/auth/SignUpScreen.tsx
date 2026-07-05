import { useOAuth, useSignUp } from '@clerk/clerk-expo';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function SignUpScreen({ navigation }: any) {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: 'oauth_apple' });

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      await setActive({ session: completeSignUp.createdSessionId });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const onGooglePress = async () => {
    setGoogleLoading(true);
    try {
      const { createdSessionId, setActive } = await startGoogleOAuthFlow({
        redirectUrl: Linking.createURL('/oauth-native-callback', { scheme: 'soouls' }),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err: any) {
      console.error('OAuth error', err);
      Alert.alert('Sign Up Error', err.errors?.[0]?.message || 'Failed to sign up with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const onApplePress = async () => {
    setAppleLoading(true);
    try {
      const { createdSessionId, setActive } = await startAppleOAuthFlow({
        redirectUrl: Linking.createURL('/oauth-native-callback', { scheme: 'soouls' }),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err: any) {
      console.error('OAuth error', err);
      Alert.alert('Sign Up Error', err.errors?.[0]?.message || 'Failed to sign up with Apple.');
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {pendingVerification ? 'Verify Email' : 'Create Account'}
          </Text>
          <Text style={styles.subtitle}>
            {pendingVerification ? 'Enter the code sent to your email' : 'Join Soouls today'}
          </Text>
        </View>

        <View style={styles.form}>
          {!pendingVerification ? (
            <>
              <Input
                label="Email"
                autoCapitalize="none"
                value={emailAddress}
                placeholder="name@example.com"
                onChangeText={(email) => setEmailAddress(email)}
              />
              <Input
                label="Password"
                value={password}
                placeholder="********"
                secureTextEntry={true}
                onChangeText={(password) => setPassword(password)}
                error={error}
              />
              <Button
                title="Sign Up"
                onPress={onSignUpPress}
                isLoading={isLoading}
                style={styles.submitButton}
              />
              <View style={styles.socialDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>
              <View style={styles.socialButtons}>
                <TouchableOpacity
                  onPress={onGooglePress}
                  disabled={googleLoading || appleLoading}
                  style={[styles.googleButton, (googleLoading || appleLoading) && { opacity: 0.6 }]}
                >
                  <AntDesign name="google" size={20} color="black" style={styles.socialIcon} />
                  <Text style={styles.googleButtonText}>
                    {googleLoading ? 'Connecting...' : 'Continue with Google'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onApplePress}
                  disabled={googleLoading || appleLoading}
                  style={[styles.appleButton, (googleLoading || appleLoading) && { opacity: 0.6 }]}
                >
                  <FontAwesome name="apple" size={20} color="white" style={styles.socialIcon} />
                  <Text style={styles.appleButtonText}>
                    {appleLoading ? 'Connecting...' : 'Continue with Apple'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Input
                label="Verification Code"
                value={code}
                placeholder="123456"
                keyboardType="number-pad"
                onChangeText={(code) => setCode(code)}
                error={error}
              />
              <Button
                title="Verify Email"
                onPress={onPressVerify}
                isLoading={isLoading}
                style={styles.submitButton}
              />
            </>
          )}

          {!pendingVerification && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: 24,
  },
  socialButtons: {
    marginTop: 16,
  },
  socialDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#8E8E93',
    fontSize: 14,
  },
  googleButton: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    marginTop: 12,
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  socialIcon: {
    marginRight: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
