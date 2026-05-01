'use client';

import { useSignIn, useUser } from '@clerk/nextjs';
import { ArrowLeft, Lock, Mail, Apple } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { SymbolLogo } from '../../components/SymbolLogo';

type Step = 'form' | 'forgot' | 'forgot-verify';

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
    } catch (err: any) {
      const msg = err.errors?.[0]?.message || 'Something went wrong.';
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
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Could not send reset code.');
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
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Reset failed.');
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

  // ─── Forgot Password: Enter Email ─────────────────────────────────────────
  if (step === 'forgot') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans p-4 overflow-hidden relative">
        <StarBackground />
        <div className="z-10 w-full max-w-[440px] bg-[#1A1110]/95 backdrop-blur-3xl border border-white/10 rounded-[32px] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
          <button onClick={() => { setStep('form'); setError(''); }} className="mb-8 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </button>
          <h2 className="text-3xl font-medium text-white mb-2">Reset Password</h2>
          <p className="text-sm text-white/40 mb-8">Enter your email to receive a reset code</p>
          {error && <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>}
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.03] border border-white/5 focus:border-[#E07A5F]/50 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/10 outline-none transition-all"
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-[#E07A5F] hover:bg-[#F08A6F] text-[#111] font-bold py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(224,122,95,0.3)] text-xs tracking-widest uppercase disabled:opacity-50">
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Forgot Password: Verify Code + New Password ──────────────────────────
  if (step === 'forgot-verify') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans p-4 overflow-hidden relative">
        <StarBackground />
        <div className="z-10 w-full max-w-[440px] bg-[#1A1110]/95 backdrop-blur-3xl border border-white/10 rounded-[32px] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
          <button onClick={() => { setStep('forgot'); setError(''); }} className="mb-8 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-3xl font-medium text-white mb-2">New Password</h2>
          <p className="text-sm text-white/40 mb-8">Enter the code sent to <span className="text-[#E07A5F]">{emailAddress}</span></p>
          {error && <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>}
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2 ml-1">Reset Code</label>
              <input
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="000000"
                className="w-full bg-white/[0.03] border border-white/5 focus:border-[#E07A5F]/50 rounded-2xl py-5 px-6 text-2xl tracking-[0.5em] text-center text-white outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2 ml-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-white/[0.03] border border-white/5 focus:border-[#E07A5F]/50 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/10 outline-none transition-all"
                  required
                  minLength={8}
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-[#E07A5F] hover:bg-[#F08A6F] text-[#111] font-bold py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(224,122,95,0.3)] text-xs tracking-widest uppercase disabled:opacity-50">
              {isLoading ? 'Resetting...' : 'Set New Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Main Login Form ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans p-4 overflow-hidden relative">
      <StarBackground />

      <div className="absolute top-12 left-12 z-20">
        <h1 className="text-4xl font-medium tracking-tight text-white/90">Soouls</h1>
      </div>

      <div className="z-10 w-full max-w-[440px] bg-[#1A1110]/95 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative">
        <div className="absolute top-10 right-10">
          <SymbolLogo className="w-10 h-10 text-[#E07A5F]" />
        </div>

        <div className="mb-10">
          <h2 className="text-3xl font-medium text-white leading-tight">Welcome<br />Back</h2>
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
              <label className="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="Enter your Email"
                  className="w-full bg-white/[0.03] border border-white/5 focus:border-[#E07A5F]/50 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/10 outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white/[0.03] border border-white/5 focus:border-[#E07A5F]/50 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/10 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <button type="button" onClick={() => { setStep('forgot'); setError(''); }} className="block text-[10px] font-bold tracking-widest text-[#E07A5F] uppercase hover:opacity-80 ml-1">
            Forgot Password?
          </button>

          <button type="submit" disabled={isLoading} className="w-full bg-[#E07A5F] hover:bg-[#F08A6F] text-[#111] font-bold py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(224,122,95,0.3)] text-xs tracking-widest uppercase disabled:opacity-50">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 flex gap-4">
          <button onClick={() => handleSocialSignIn('oauth_google')} className="flex-1 bg-white/[0.03] border border-white/10 py-4 rounded-2xl flex items-center justify-center hover:bg-white/[0.06] transition-all">
            <FcGoogle className="w-6 h-6" />
          </button>
          <button onClick={() => handleSocialSignIn('oauth_apple')} className="flex-1 bg-white/[0.03] border border-white/10 py-4 rounded-2xl flex items-center justify-center hover:bg-white/[0.06] transition-all">
            <Apple className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-white/30">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-[#E07A5F] hover:underline transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

function StarBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute top-[20%] left-[10%] w-1 h-1 bg-white rounded-full animate-pulse opacity-40 shadow-[0_0_8px_white]" />
      <div className="absolute top-[40%] right-[20%] w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-20" style={{ animationDelay: '0.7s' }} />
      <div className="absolute bottom-[30%] left-[25%] w-1 h-1 bg-white rounded-full animate-pulse opacity-30" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[10%] right-[40%] w-1 h-1 bg-[#E07A5F] rounded-full animate-pulse opacity-40 shadow-[0_0_12px_#E07A5F]" style={{ animationDelay: '0.3s' }} />
      <div className="absolute top-[70%] right-[15%] w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-30" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-[55%] left-[45%] w-1 h-1 bg-white rounded-full animate-pulse opacity-15" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-[radial-gradient(circle_at_center,rgba(224,122,95,0.05)_0%,transparent_70%)]" />

      {/* Constellation lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
        <line x1="20%" y1="20%" x2="40%" y2="40%" stroke="white" strokeWidth="0.5" />
        <line x1="40%" y1="40%" x2="35%" y2="60%" stroke="white" strokeWidth="0.5" />
        <line x1="80%" y1="10%" x2="70%" y2="30%" stroke="white" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
