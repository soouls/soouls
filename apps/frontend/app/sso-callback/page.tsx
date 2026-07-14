import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallback() {
  // Handle the redirect after social sign-in/up
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--soouls-accent)] border-t-transparent" />
        <p className="text-sm font-medium text-white/40 uppercase tracking-widest">
          Securing your connection...
        </p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
