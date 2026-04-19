import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SignUpSsoCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/onboarding"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      continueSignUpUrl="/onboarding"
    />
  );
}
