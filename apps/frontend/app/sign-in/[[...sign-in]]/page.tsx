'use client';

import { useSignIn, useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { SymbolLogo } from '../../components/SymbolLogo';

type Step = 'form' | 'forgot' | 'forgot-verify';

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

function AppleLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <title>Apple Logo</title>
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.75.8-.01 1.94-.8 3.55-.63 2.18.12 3.86 1.15 4.7 2.65-4.52 2.71-3.79 8.78.7 10.5-.83 2.09-2.05 4.2-4.03 4.2h-.03zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.23 2.5-2.12 4.41-3.74 4.25z" />
    </svg>
  );
}

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const { user } = useUser();

  const [step, setStep] = useState<Step>('form');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace('/home');
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  // ─── Email/Password Sign-In ─────────────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.create({ identifier: emailAddress, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/home');
      } else {
        setError('Additional verification required.');
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Something went wrong.');
      if (msg.toLowerCase().includes('no account')) {
        setError('No account found. Please sign up first.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Forgot Password: Send Code ────────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: emailAddress,
      });
      setStep('forgot-verify');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not send reset code.'));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Forgot Password: Verify & Reset ───────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: resetCode,
        password: newPassword,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/home');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Reset failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Social Sign-In ────────────────────────────────────────────────────────
  const handleSocialSignIn = (strategy: 'oauth_google' | 'oauth_apple') => {
    if (!isLoaded || !signIn) return;
    signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/home',
    });
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

      <AnimatePresence mode="wait">
        {step === 'forgot' && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="z-10 w-full max-w-[440px] bg-[#120D0D]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[36px] p-8 md:p-10 shadow-[0_50px_100px_rgba(0,0,0,0.85)]"
          >
            <button
              type="button"
              onClick={() => {
                setStep('form');
                setError('');
              }}
              className="mb-8 text-white/40 hover:text-[#E07A5F] transition-colors flex items-center gap-2 text-xs font-bold tracking-widest uppercase"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </button>
            <h2 className="text-3xl font-medium text-white mb-2 tracking-tight">Reset Password</h2>
            <p className="text-sm text-white/40 mb-8 font-light">
              Enter your email to receive a reset code
            </p>
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2 ml-1"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#E07A5F] transition-colors" />
                  <input
                    id="forgot-email"
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
          </motion.div>
        )}

        {step === 'forgot-verify' && (
          <motion.div
            key="forgot-verify"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="z-10 w-full max-w-[440px] bg-[#120D0D]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[36px] p-8 md:p-10 shadow-[0_50px_100px_rgba(0,0,0,0.85)]"
          >
            <button
              type="button"
              onClick={() => {
                setStep('forgot');
                setError('');
              }}
              className="mb-8 text-white/40 hover:text-[#E07A5F] transition-colors flex items-center gap-2 text-xs font-bold tracking-widest uppercase"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h2 className="text-3xl font-medium text-white mb-2 tracking-tight">New Password</h2>
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
                  htmlFor="reset-code"
                  className="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2 ml-1"
                >
                  Reset Code
                </label>
                <input
                  id="reset-code"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="000000"
                  className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-[#E07A5F]/50 focus:bg-white/[0.04] rounded-2xl py-5 px-6 text-2xl tracking-[0.5em] text-center text-white outline-none transition-all duration-300 font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="reset-password"
                  className="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2 ml-1"
                >
                  New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#E07A5F] transition-colors" />
                  <input
                    id="reset-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
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
                {isLoading ? 'Resetting...' : 'Set New Password'}
              </button>
            </form>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="z-10 w-full max-w-[440px] bg-[#120D0D]/80 backdrop-blur-2xl border border-white/[0.08] rounded-[40px] p-10 md:p-12 shadow-[0_50px_120px_rgba(0,0,0,0.85)] relative"
          >
            <div className="absolute top-10 right-10">
              <SymbolLogo
                className="w-10 h-10 text-[#E07A5F] animate-pulse"
                style={{ animationDuration: '3s' }}
              />
            </div>

            <div className="mb-10">
              <h2 className="text-4xl font-medium text-[#EFEBDD] leading-none tracking-tight">
                Welcome
                <br />
                <span className="font-playfair italic font-normal text-[#E07A5F] mt-1 inline-block">
                  Back
                </span>
              </h2>
            </div>

            {error && (
              <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
                {error.includes('sign up') && (
                  <Link href="/sign-up" className="block mt-2 text-[#E07A5F] hover:underline">
                    Create Identity →
                  </Link>
                )}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="sign-in-email"
                    className="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2 ml-1"
                  >
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#E07A5F] transition-colors" />
                    <input
                      id="sign-in-email"
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="Enter your Email"
                      className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-[#E07A5F]/50 focus:bg-white/[0.04] rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-300"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="sign-in-password"
                    className="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2 ml-1"
                  >
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#E07A5F] transition-colors" />
                    <input
                      id="sign-in-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-[#E07A5F]/50 focus:bg-white/[0.04] rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-300"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setStep('forgot');
                    setError('');
                  }}
                  className="block text-[10px] font-bold tracking-widest text-[#E07A5F]/70 uppercase hover:text-[#E07A5F] transition-colors ml-1"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#E07A5F] hover:bg-[#F08A6F] text-[#111] font-bold py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(224,122,95,0.25)] hover:shadow-[0_10px_30px_rgba(224,122,95,0.45)] hover:scale-[1.01] active:scale-[0.99] text-xs tracking-widest uppercase disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="relative my-8 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <span className="relative bg-[#141010] px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
                or connect via
              </span>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleSocialSignIn('oauth_google')}
                className="flex-1 bg-white/[0.02] border border-white/[0.08] py-4 rounded-2xl flex items-center justify-center hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <FcGoogle className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignIn('oauth_apple')}
                className="flex-1 bg-white/[0.02] border border-white/[0.08] py-4 rounded-2xl flex items-center justify-center hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <AppleLogo className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="mt-10 text-center text-xs text-white/30">
              Don&apos;t have an account?{' '}
              <Link
                href="/sign-up"
                className="text-[#E07A5F] hover:text-[#F08A6F] font-semibold hover:underline transition-colors ml-1"
              >
                Sign Up
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

      {/* Dynamic particles */}
      {stars.map((star, i) => (
        <div
          key={`${star.left}-${star.top}-${i}`}
          className="absolute bg-white rounded-full opacity-20"
          style={{
            width: `${star.width}px`,
            height: `${star.width}px`,
            top: `${star.top}%`,
            left: `${star.left}%`,
            animation: `pulse ${star.duration}s infinite ${star.delay}s`,
          }}
        />
      ))}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-[radial-gradient(circle_at_center,rgba(224,122,95,0.06)_0%,transparent_70%)]" />

      {/* Constellation lines */}
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
