'use client';

import { useSignUp, useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { SymbolLogo } from '../../components/SymbolLogo';

type Step = 'form' | 'verify' | 'phone-password';

function getClerkErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'errors' in error) {
    const clerkError = error as { errors?: Array<{ message?: string }> };
    return clerkError.errors?.[0]?.message || fallback;
  }
  return fallback;
}

export default function SignUpPage() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { user } = useUser();

  const [step, setStep] = useState<Step>('form');

  // Form State
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  useEffect(() => {
    if (user) {
      router.replace('/home');
    }
  }, [router, user]);

  if (user) return null;

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setIsLoading(true);
    setError('');

    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
    } catch (err) {
      setError(getClerkErrorMessage(err, 'Something went wrong.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setIsLoading(true);
    setError('');

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/onboarding');
      }
    } catch (err) {
      setError(getClerkErrorMessage(err, 'Invalid code.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (strategy: 'oauth_google' | 'oauth_apple') => {
    if (!isLoaded || !signUp) return;
    setError('');
    setSocialLoading(strategy === 'oauth_google' ? 'google' : 'apple');

    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/onboarding',
      });
    } catch (err) {
      setSocialLoading(null);
      setError(getClerkErrorMessage(err, 'Could not start social sign up.'));
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-x-hidden overflow-y-auto bg-[#0A0707] px-4 py-24 font-sans selection:bg-[#E07A5F]/30 selection:text-white sm:px-6 lg:px-8">
      <StarBackground />

      <Link
        href="/"
        className="absolute top-5 left-5 z-20 flex items-center gap-2.5 group sm:top-8 sm:left-8 lg:top-12 lg:left-12"
      >
        <SymbolLogo
          variant="solid"
          className="w-8 h-8 text-[#E07A5F] group-hover:rotate-12 transition-transform duration-500"
        />
        <span className="text-[22px] font-bold tracking-tight text-white/95 font-sans">Soouls</span>
      </Link>

      <AnimatePresence mode="wait">
        {step === 'verify' && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="z-10 w-full max-w-[440px] rounded-[28px] border border-white/[0.08] bg-[#120D0D]/80 p-6 shadow-[0_50px_100px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:rounded-[36px] sm:p-8 md:p-10"
          >
            <button
              type="button"
              onClick={() => setStep('form')}
              className="mb-8 text-white/40 hover:text-[#E07A5F] transition-colors flex items-center gap-2 text-xs font-bold tracking-widest uppercase"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h2 className="text-3xl font-medium text-white mb-2 tracking-tight">Verify Email</h2>
            <p className="text-sm text-white/40 mb-8 font-light">
              Enter the code sent to {emailAddress}
            </p>
            <form onSubmit={handleVerify} className="space-y-6">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-[#E07A5F]/50 focus:bg-white/[0.04] rounded-2xl py-5 px-6 text-2xl tracking-[0.5em] text-center text-white outline-none transition-all duration-300 font-mono font-bold"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#E07A5F] hover:bg-[#F08A6F] text-[#111] font-bold py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(224,122,95,0.25)] hover:shadow-[0_10px_30px_rgba(224,122,95,0.45)] text-xs tracking-widest uppercase disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Complete Registration'}
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
            className="relative z-10 w-full max-w-[440px] rounded-[28px] border border-white/[0.08] bg-[#120D0D]/80 p-6 shadow-[0_50px_120px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:rounded-[40px] sm:p-10 md:p-12"
          >
            <div className="absolute top-6 right-6 sm:top-10 sm:right-10">
              <SymbolLogo
                className="w-10 h-10 text-[#E07A5F] animate-pulse"
                style={{ animationDuration: '3s' }}
              />
            </div>

            <div className="mb-8 sm:mb-10">
              <h2 className="text-[clamp(2.25rem,9vw,2.75rem)] font-medium text-[#EFEBDD] leading-none tracking-tight">
                Begin Your
                <br />
                <span className="font-playfair italic font-normal text-[#E07A5F] mt-1 inline-block">
                  Journey
                </span>
              </h2>
            </div>

            {error && (
              <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailSignUp} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2 ml-1"
                  >
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#E07A5F] transition-colors" />
                    <input
                      id="signup-email"
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
                    htmlFor="signup-password"
                    className="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2 ml-1"
                  >
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#E07A5F] transition-colors" />
                    <input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-[#E07A5F]/50 focus:bg-white/[0.04] rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-300"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/sign-in"
                  className="block text-[10px] font-bold tracking-widest text-[#E07A5F]/75 uppercase hover:text-[#E07A5F] transition-colors ml-1"
                >
                  Already have an account? Sign In
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#E07A5F] hover:bg-[#F08A6F] text-[#111] font-bold py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(224,122,95,0.25)] hover:shadow-[0_10px_30px_rgba(224,122,95,0.45)] hover:scale-[1.01] active:scale-[0.99] text-xs tracking-widest uppercase disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Sign Up'}
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <button
                type="button"
                onClick={() => handleSocialSignUp('oauth_google')}
                disabled={Boolean(socialLoading) || isLoading}
                aria-label="Continue with Google"
                className="inline-flex min-h-[56px] items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white/62 transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/[0.06] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FcGoogle className="w-6 h-6" />
                <span className="sm:hidden">Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignUp('oauth_apple')}
                disabled={Boolean(socialLoading) || isLoading}
                aria-label="Continue with Apple"
                className="inline-flex min-h-[56px] items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white/62 transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/[0.06] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaApple aria-hidden="true" className="h-6 w-6 text-white" />
                <span className="sm:hidden">Apple</span>
              </button>
            </div>

            <div className="mt-10 text-center text-xs text-white/30">
              Returning to Soouls?{' '}
              <Link
                href="/sign-in"
                className="text-[#E07A5F] hover:text-[#F08A6F] font-semibold hover:underline transition-colors ml-1"
              >
                Sign In
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
