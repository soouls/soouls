'use client';

import { useSignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthSocialActions } from '../../components/auth/AuthSocialActions';
import { AuthButton, AuthInput, AuthScaffold } from '../../components/auth/auth-ui';

function getClerkErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray((error as { errors?: Array<{ longMessage?: string; message?: string }> }).errors)
  ) {
    const first = (error as { errors: Array<{ longMessage?: string; message?: string }> })
      .errors[0];
    return first?.longMessage || first?.message || 'Something went wrong. Please try again.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

export default function SignUpPage() {
  const router = useRouter();
  const { isLoaded, setActive, signUp } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [stage, setStage] = useState<'credentials' | 'verify'>('credentials');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<
    'oauth_google' | 'oauth_facebook' | 'oauth_apple' | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLoaded) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signUp.create({
        emailAddress: email.trim(),
        password,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.replace('/onboarding');
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStage('verify');
    } catch (caughtError) {
      setError(getClerkErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLoaded) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });

      if (result.status !== 'complete' || !result.createdSessionId) {
        setError('Your email is not verified yet. Please check the code and try again.');
        return;
      }

      await setActive({ session: result.createdSessionId });
      router.replace('/onboarding');
    } catch (caughtError) {
      setError(getClerkErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOAuth(strategy: 'oauth_google' | 'oauth_facebook' | 'oauth_apple') {
    if (!isLoaded) {
      return;
    }

    setError(null);
    setSocialLoading(strategy);

    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-up/sso-callback',
        redirectUrlComplete: '/onboarding',
      });
    } catch (caughtError) {
      setError(getClerkErrorMessage(caughtError));
      setSocialLoading(null);
    }
  }

  return (
    <AuthScaffold
      eyebrow="Calibrate Your Space"
      title={
        <>
          Build the
          <br />
          <span className="italic text-[var(--app-accent-strong)]">private universe</span>
        </>
      }
      description="No generic sign-up widget. Just a custom entry flow that hands off to your first-time calibration the moment the account is real."
      footer="Custom Clerk Sign Up"
      sideNote={<span>First-time setup takes under two minutes</span>}
    >
      {stage === 'credentials' ? (
        <form className="space-y-6" onSubmit={handleCreateAccount}>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--app-accent)]">
              Create an identity
            </p>
            <p className="text-sm leading-7 text-[var(--app-text-muted)]">
              Sign up, verify your email, then we’ll take you into the 7-part onboarding ritual you
              described.
            </p>
          </div>

          <AuthInput
            label="Email Address"
            value={email}
            onChange={setEmail}
            placeholder="you@youruniverse.space"
            type="email"
            autoComplete="email"
          />

          <AuthInput
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Create a private key"
            type="password"
            autoComplete="new-password"
            hint="Use at least 8 characters. Clerk still handles the actual security policy underneath."
          />

          {error ? (
            <div className="rounded-[1.4rem] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <AuthButton type="submit" disabled={isSubmitting || !email.trim() || !password.trim()}>
            {isSubmitting ? 'Creating identity…' : 'Begin My Journey'}
          </AuthButton>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-xs uppercase tracking-[0.28em] text-[var(--app-text-muted)]">
              <span className="h-px flex-1 bg-white/10" />
              <span>Or enter another way</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <AuthSocialActions
              onSelect={handleOAuth}
              loadingStrategy={socialLoading}
              modeLabel="Sign up"
            />
          </div>

          <div className="grid gap-3 rounded-[1.8rem] border border-[var(--app-border)] bg-black/10 p-4 text-sm text-[var(--app-text-muted)] sm:grid-cols-3">
            <div>Private journaling atmosphere</div>
            <div>7-step onboarding calibration</div>
            <div>Theme and tone saved to your profile</div>
          </div>

          <p className="text-center text-sm text-[var(--app-text-muted)]">
            Already have a universe?{' '}
            <Link
              href="/sign-in"
              className="text-[var(--app-accent)] transition hover:brightness-110"
            >
              Sign in here
            </Link>
          </p>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={handleVerify}>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--app-accent)]">
              Verify your signal
            </p>
            <h2 className="font-editorial text-4xl text-[var(--app-text)]">Check your email</h2>
            <p className="text-sm leading-7 text-[var(--app-text-muted)]">
              We sent a verification code to <span className="text-[var(--app-text)]">{email}</span>
              . Enter it below and we’ll start the onboarding flow immediately.
            </p>
          </div>

          <AuthInput
            label="Verification Code"
            value={verificationCode}
            onChange={setVerificationCode}
            placeholder="6-digit code"
            autoComplete="one-time-code"
          />

          {error ? (
            <div className="rounded-[1.4rem] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <AuthButton type="submit" disabled={isSubmitting || !verificationCode.trim()}>
            {isSubmitting ? 'Verifying…' : 'Open My Universe'}
          </AuthButton>

          <button
            type="button"
            onClick={() => setStage('credentials')}
            className="w-full text-sm text-[var(--app-text-muted)] transition hover:text-[var(--app-text)]"
          >
            Back to account details
          </button>
        </form>
      )}
    </AuthScaffold>
  );
}
