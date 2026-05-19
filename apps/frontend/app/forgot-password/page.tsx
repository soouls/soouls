'use client';

import { useSignIn } from '@clerk/nextjs';
import { ArrowLeft, CheckCircle2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SymbolLogo } from '../components/SymbolLogo';

type Step = 'email' | 'code' | 'success';

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray((error as { errors?: unknown[] }).errors)
  ) {
    const [firstError] = (error as { errors?: Array<{ message?: string }> }).errors ?? [];
    if (typeof firstError?.message === 'string' && firstError.message.length > 0) {
      return firstError.message;
    }
  }

  return fallback;
}

export default function ForgotPassword() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<Step>('email');
  const [emailAddress, setEmailAddress] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ─── Step 1: Send Reset Code ────────────────────────────────────────────────
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: emailAddress,
      });
      setStep('code');
    } catch (err: unknown) {
      console.error(err);
      const msg = getErrorMessage(err, 'Failed to send reset code.');
      if (msg.toLowerCase().includes('no account') || msg.toLowerCase().includes('not found')) {
        setError('No account found with this email address.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2: Verify Code + Set New Password ────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        setStep('success');
        // Redirect to dashboard after a short delay
        setTimeout(() => router.push('/home'), 2000);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, 'Invalid code or password. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0707] flex items-center justify-center font-sans p-4 overflow-hidden relative selection:bg-[#E07A5F]/30 selection:text-white">
      <StarBackground />

      <Link
        href="/"
        className="absolute top-8 left-8 sm:top-12 sm:left-12 z-20 flex items-center gap-2.5 group"
      >
        <SymbolLogo
          variant="solid"
          className="w-8 h-8 text-[#E07A5F] group-hover:rotate-12 transition-transform duration-500"
        />
        <span className="text-[22px] font-bold tracking-tight text-white/95 font-sans">Soouls</span>
      </Link>

      {/* Glow Effects Container */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[450px] h-[450px] rounded-full bg-[#E07A5F]/5 blur-[120px] translate-x-[-10%] translate-y-[-10%]" />
      </div>

      <div className="z-10 w-full max-w-[440px] bg-[#120D0D]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[36px] p-8 md:p-10 shadow-[0_50px_100px_rgba(0,0,0,0.85)] relative">
        {step === 'success' && (
          <div className="text-center py-6">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <h2 className="text-3xl font-medium text-white mb-4 tracking-tight">Password Reset!</h2>
            <p className="text-sm text-white/40 mb-8 leading-relaxed">
              Your password has been updated successfully. Redirecting you to the dashboard...
            </p>
            <div className="relative w-8 h-8 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 animate-spin" />
            </div>
          </div>
        )}

        {step === 'code' && (
          <div>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setError('');
              }}
              className="mb-8 text-white/40 hover:text-[#E07A5F] transition-colors flex items-center gap-2 text-xs font-bold tracking-widest uppercase"
            >
              <ArrowLeft className="w-4 h-4" /> Change Email
            </button>

            <h2 className="text-3xl font-medium text-white mb-2 tracking-tight">Reset Password</h2>
            <p className="text-sm text-white/40 mb-8 font-light">
              Enter the code sent to{' '}
              <span className="text-[#E07A5F] font-normal">{emailAddress}</span>
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label
                  htmlFor="forgot-reset-code"
                  className="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2 ml-1"
                >
                  Verification Code
                </label>
                <input
                  id="forgot-reset-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="000000"
                  className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-[#E07A5F]/50 focus:bg-white/[0.04] rounded-2xl py-5 px-6 text-2xl tracking-[0.5em] text-center text-white outline-none transition-all duration-300 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="forgot-new-password"
                  className="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2 ml-1"
                >
                  New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#E07A5F] transition-colors" />
                  <input
                    id="forgot-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 8 chars)"
                    className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-[#E07A5F]/50 focus:bg-white/[0.04] rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-300"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="forgot-confirm-password"
                  className="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2 ml-1"
                >
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#E07A5F] transition-colors" />
                  <input
                    id="forgot-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-[#E07A5F]/50 focus:bg-white/[0.04] rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-300"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#E07A5F] hover:bg-[#F08A6F] text-[#111] font-bold py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(224,122,95,0.25)] hover:shadow-[0_10px_30px_rgba(224,122,95,0.45)] hover:scale-[1.01] active:scale-[0.99] text-xs tracking-widest uppercase disabled:opacity-50"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        )}

        {step === 'email' && (
          <div>
            <Link
              href="/sign-in"
              className="mb-8 text-white/40 hover:text-[#E07A5F] transition-colors flex items-center gap-2 text-xs font-bold tracking-widest uppercase inline-flex"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>

            <h2 className="text-3xl font-medium text-white mb-2 tracking-tight">
              Forgot Password?
            </h2>
            <p className="text-sm text-white/40 mb-8 font-light leading-relaxed">
              No worries. Enter your email and we'll send you a code to reset your password.
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label
                  htmlFor="forgot-email-address"
                  className="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2 ml-1"
                >
                  Account Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#E07A5F] transition-colors" />
                  <input
                    id="forgot-email-address"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-[#E07A5F]/50 focus:bg-white/[0.04] rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#E07A5F] hover:bg-[#F08A6F] text-[#111] font-bold py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(224,122,95,0.25)] hover:shadow-[0_10px_30px_rgba(224,122,95,0.45)] hover:scale-[1.01] active:scale-[0.99] text-xs tracking-widest uppercase disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function StarBackground() {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    width: 0.6 + ((i * 37) % 14) / 10,
    top: (i * 23) % 100,
    left: (i * 41) % 100,
    duration: 2 + ((i * 17) % 30) / 10,
    delay: ((i * 11) % 50) / 10,
  }));

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="absolute top-[20%] left-[10%] w-1 h-1 bg-white rounded-full animate-pulse opacity-40 shadow-[0_0_8px_white]" />
      <div
        className="absolute top-[40%] right-[20%] w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-20"
        style={{ animationDelay: '0.7s' }}
      />
      <div
        className="absolute bottom-[30%] left-[25%] w-1 h-1 bg-white rounded-full animate-pulse opacity-30"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute top-[10%] right-[40%] w-1 h-1 bg-[#E07A5F] rounded-full animate-pulse opacity-40 shadow-[0_0_12px_#E07A5F]"
        style={{ animationDelay: '0.3s' }}
      />
      <div
        className="absolute top-[70%] right-[15%] w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-30"
        style={{ animationDelay: '1.5s' }}
      />
      <div
        className="absolute top-[55%] left-[45%] w-1 h-1 bg-white rounded-full animate-pulse opacity-15"
        style={{ animationDelay: '2s' }}
      />

      {stars.map((star, i) => (
        <div
          key={`${star.left}-${star.top}-${i}`}
          className="absolute bg-white rounded-full opacity-20 animate-pulse"
          style={{
            width: `${star.width}px`,
            height: `${star.width}px`,
            top: `${star.top}%`,
            left: `${star.left}%`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-[radial-gradient(circle_at_center,rgba(224,122,95,0.06)_0%,transparent_70%)]" />

      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
      >
        <title>Constellations</title>
        <line x1="20%" y1="20%" x2="40%" y2="40%" stroke="white" strokeWidth="0.5" />
        <line x1="40%" y1="40%" x2="35%" y2="60%" stroke="white" strokeWidth="0.5" />
        <line x1="80%" y1="10%" x2="70%" y2="30%" stroke="white" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
