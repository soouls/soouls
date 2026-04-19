'use client';

import { useSignIn } from '@clerk/nextjs';
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

export default function SignInPage() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepAlive, setKeepAlive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<
    'oauth_google' | 'oauth_facebook' | 'oauth_apple' | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLoaded) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status !== 'complete' || !result.createdSessionId) {
        setError('Your sign-in needs another step that is not configured in this custom flow yet.');
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

  async function handleOAuth(strategy: 'oauth_google' | 'oauth_facebook' | 'oauth_apple') {
    if (!isLoaded) {
      return;
    }

    setError(null);
    setSocialLoading(strategy);

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-in/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
    } catch (caughtError) {
      setError(getClerkErrorMessage(caughtError));
      setSocialLoading(null);
    }
  }

  return (
    <AuthScaffold
      eyebrow="Return To The Sanctuary"
      title={
        <>
          Return to the
          <br />
          <span className="italic text-[var(--app-accent-strong)]">Sanctuary</span>
        </>
      }
      description="Your private universe is waiting where you left it. Step back in quietly, and we’ll bring the atmosphere back with you."
      footer="SoulCanvas Digital Sanctuary"
      sideNote={<span>{keepAlive ? 'Session stays warm' : 'Private session'}</span>}
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--app-accent)]">
            Continue your creative journey
          </p>
          <h2 className="font-editorial text-4xl leading-none text-[var(--app-text)] lg:hidden">
            Enter the sanctuary
          </h2>
          <p className="text-sm leading-7 text-[var(--app-text-muted)]">
            Custom auth UI on top of Clerk, tuned to the product style you shared.
          </p>
        </div>

        <AuthInput
          label="Email Address"
          value={email}
          onChange={setEmail}
          placeholder="curator@soulcanvas.space"
          type="email"
          autoComplete="email"
        />

        <AuthInput
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your private key"
          type="password"
          autoComplete="current-password"
        />

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--app-text-muted)]">
          <label className="inline-flex items-center gap-3">
            <input
              checked={keepAlive}
              onChange={(event) => setKeepAlive(event.target.checked)}
              type="checkbox"
              className="h-4 w-4 rounded border-[var(--app-border)] bg-transparent text-[var(--app-accent)] focus:ring-[var(--app-accent)]"
            />
            Keep session active
          </label>

          <Link
            href="/forgot-password"
            className="text-[var(--app-accent)] transition hover:brightness-110"
          >
            Forgot key?
          </Link>
        </div>

        {error ? (
          <div className="rounded-[1.4rem] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <AuthButton type="submit" disabled={isSubmitting || !email.trim() || !password.trim()}>
          {isSubmitting ? 'Opening your universe…' : 'Enter the Sanctuary'}
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
            modeLabel="Sign in"
          />
        </div>

        <div className="rounded-[1.6rem] border border-[var(--app-border)] bg-black/10 p-4 text-sm leading-7 text-[var(--app-text-muted)]">
          Returning after onboarding? We’ll route you straight back in. If your profile still needs
          calibration, the first-time flow will resume automatically.
        </div>

        <p className="text-center text-sm text-[var(--app-text-muted)]">
          New to the collective?{' '}
          <Link
            href="/sign-up"
            className="text-[var(--app-accent)] transition hover:brightness-110"
          >
            Create an identity
          </Link>
        </p>
      </form>
    </AuthScaffold>
  );
}
