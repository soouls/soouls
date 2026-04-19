'use client';

import { useSignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthButton, AuthInput, AuthScaffold } from '../components/auth/auth-ui';

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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isLoaded, setActive, signIn } = useSignIn();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [stage, setStage] = useState<'request' | 'reset'>('request');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function requestReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLoaded) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email.trim(),
      });

      setStage('reset');
      setNotice('A recovery code is on its way. Enter it with your new password below.');
    } catch (caughtError) {
      setError(getClerkErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function completeReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLoaded) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.trim(),
        password,
      });

      if (result.status !== 'complete' || !result.createdSessionId) {
        setError('The reset is not complete yet. Please check the code and try again.');
        return;
      }

      await setActive({ session: result.createdSessionId });
      router.replace('/dashboard');
    } catch (caughtError) {
      setError(getClerkErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScaffold
      eyebrow="Restore Access"
      title={
        <>
          Restore
          <br />
          <span className="italic text-[var(--app-accent-strong)]">Access</span>
        </>
      }
      description="Take a breath. Enter your registered email and we’ll help you find the way back without dropping you into a stock recovery screen."
      footer="Recovery Flow"
      sideNote={<span>Private recovery link</span>}
    >
      {stage === 'request' ? (
        <form className="space-y-6" onSubmit={requestReset}>
          <AuthInput
            label="Account Email"
            value={email}
            onChange={setEmail}
            placeholder="curator@soulcanvas.space"
            type="email"
            autoComplete="email"
          />

          {error ? (
            <div className="rounded-[1.4rem] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <AuthButton type="submit" disabled={isSubmitting || !email.trim()}>
            {isSubmitting ? 'Sending recovery code…' : 'Send Recovery Link'}
          </AuthButton>

          <Link
            href="/sign-in"
            className="block text-center text-sm text-[var(--app-text-muted)] transition hover:text-[var(--app-text)]"
          >
            Back to entry
          </Link>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={completeReset}>
          <div className="rounded-[1.4rem] border border-[var(--app-border)] bg-black/10 px-4 py-3 text-sm text-[var(--app-text-muted)]">
            {notice}
          </div>

          <AuthInput
            label="Recovery Code"
            value={code}
            onChange={setCode}
            placeholder="6-digit code"
            autoComplete="one-time-code"
          />

          <AuthInput
            label="New Password"
            value={password}
            onChange={setPassword}
            placeholder="Choose a new private key"
            type="password"
            autoComplete="new-password"
          />

          {error ? (
            <div className="rounded-[1.4rem] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <AuthButton type="submit" disabled={isSubmitting || !code.trim() || !password.trim()}>
            {isSubmitting ? 'Restoring access…' : 'Return to the Sanctuary'}
          </AuthButton>

          <button
            type="button"
            onClick={() => setStage('request')}
            className="w-full text-sm text-[var(--app-text-muted)] transition hover:text-[var(--app-text)]"
          >
            Use a different email
          </button>
        </form>
      )}
    </AuthScaffold>
  );
}
