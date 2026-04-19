'use client';

import { Apple, Facebook, Chrome } from 'lucide-react';

type AuthStrategy = 'oauth_google' | 'oauth_facebook' | 'oauth_apple';

type AuthSocialActionsProps = {
  onSelect: (strategy: AuthStrategy) => Promise<void>;
  loadingStrategy: AuthStrategy | null;
  modeLabel: 'Sign in' | 'Sign up';
};

const PROVIDERS: Array<{
  id: AuthStrategy;
  label: string;
  Icon: typeof Chrome;
}> = [
  { id: 'oauth_google', label: 'Continue with Google', Icon: Chrome },
  { id: 'oauth_facebook', label: 'Continue with Facebook', Icon: Facebook },
  { id: 'oauth_apple', label: 'Continue with Apple', Icon: Apple },
];

export function AuthSocialActions({
  onSelect,
  loadingStrategy,
  modeLabel,
}: AuthSocialActionsProps) {
  return (
    <div className="space-y-3" aria-label={`${modeLabel} with social providers`}>
      {PROVIDERS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => void onSelect(id)}
          disabled={loadingStrategy !== null}
          className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[var(--app-border)] bg-white/5 px-5 py-4 text-base text-[var(--app-text)] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span>{loadingStrategy === id ? 'Connecting...' : label}</span>
        </button>
      ))}
    </div>
  );
}
