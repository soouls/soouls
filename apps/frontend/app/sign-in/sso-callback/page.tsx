import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SignInSsoCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/onboarding"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    />
  );
}
