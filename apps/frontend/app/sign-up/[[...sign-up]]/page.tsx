'use client';

import { AuthenticateWithRedirectCallback, useSignUp, useUser } from '@clerk/nextjs';
import { ArrowLeft, Mail, Lock, User, Apple } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { SymbolLogo } from '../../components/SymbolLogo';

type AuthMethod = 'email' | 'phone';
type Step = 'form' | 'verify' | 'phone-password';

export default function SignUpPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { user } = useUser();

  const [step, setStep] = useState<Step>('form');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');

  // Form State
  const [username, setUsername] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    router.replace('/home');
    return null;
  }

  if (pathname?.includes('sso-callback')) {
    return <AuthenticateWithRedirectCallback />;
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setIsLoading(true);
    setError('');

    try {
      await signUp.create({ username, emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Something went wrong.');
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
        router.push('/home');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = (strategy: 'oauth_google' | 'oauth_apple') => {
    if (!isLoaded || !signUp) return;
    signUp.authenticateWithRedirect({
      strategy,
      redirectUrl: '/sign-up/sso-callback',
      redirectUrlComplete: '/home',
    });
  };

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans p-4 overflow-hidden relative">
        <StarBackground />
        <div className="z-10 w-full max-w-[440px] bg-[#1A1110]/95 backdrop-blur-3xl border border-white/10 rounded-[32px] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
          <button onClick={() => setStep('form')} className="mb-8 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-3xl font-medium text-white mb-2">Verify Email</h2>
          <p className="text-sm text-white/40 mb-8">Enter the code sent to {emailAddress}</p>
          <form onSubmit={handleVerify} className="space-y-6">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              className="w-full bg-white/[0.03] border border-white/5 focus:border-[#E07A5F]/50 rounded-2xl py-5 px-6 text-2xl tracking-[0.5em] text-center text-white outline-none transition-all"
              required
            />
            <button type="submit" disabled={isLoading} className="w-full bg-[#E07A5F] hover:bg-[#F08A6F] text-[#111] font-bold py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(224,122,95,0.3)]">
              {isLoading ? 'Verifying...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
          <h2 className="text-3xl font-medium text-white leading-tight">Begin Your<br />Journey</h2>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignUp} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-white/[0.03] border border-white/5 focus:border-[#E07A5F]/50 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/10 outline-none transition-all"
                  required
                />
              </div>
            </div>
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
                  placeholder="Create a password"
                  className="w-full bg-white/[0.03] border border-white/5 focus:border-[#E07A5F]/50 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/10 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <Link href="/sign-in" className="block text-[10px] font-bold tracking-widest text-[#E07A5F] uppercase hover:opacity-80 ml-1">
            Forgot Password?
          </Link>

          <button type="submit" disabled={isLoading} className="w-full bg-[#E07A5F] hover:bg-[#F08A6F] text-[#111] font-bold py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(224,122,95,0.3)] text-xs tracking-widest uppercase">
            {isLoading ? 'Processing...' : 'Signup'}
          </button>
        </form>

        <div className="mt-8 flex gap-4">
          <button onClick={() => handleSocialSignUp('oauth_google')} className="flex-1 bg-white/[0.03] border border-white/10 py-4 rounded-2xl flex items-center justify-center hover:bg-white/[0.06] transition-all">
            <FcGoogle className="w-6 h-6" />
          </button>
          <button onClick={() => handleSocialSignUp('oauth_apple')} className="flex-1 bg-white/[0.03] border border-white/10 py-4 rounded-2xl flex items-center justify-center hover:bg-white/[0.06] transition-all">
            <Apple className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StarBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute top-[20%] left-[10%] w-1 h-1 bg-white rounded-full animate-pulse opacity-40 shadow-[0_0_8px_white]" />
      <div className="absolute top-[40%] right-[20%] w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-20 delay-700" />
      <div className="absolute bottom-[30%] left-[25%] w-1 h-1 bg-white rounded-full animate-pulse opacity-30 delay-1000" />
      <div className="absolute top-[10%] right-[40%] w-1 h-1 bg-[#E07A5F] rounded-full animate-pulse opacity-40 delay-300 shadow-[0_0_12px_#E07A5F]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-[radial-gradient(circle_at_center,rgba(224,122,95,0.05)_0%,transparent_70%)]" />
      
      {/* Tiny stars */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full opacity-20"
          style={{
            width: Math.random() * 2 + 'px',
            height: Math.random() * 2 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            animation: `pulse ${Math.random() * 3 + 2}s infinite ${Math.random() * 5}s`,
          }}
        />
      ))}

      {/* Constellation lines - simplified */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
        <line x1="20%" y1="20%" x2="40%" y2="40%" stroke="white" strokeWidth="0.5" />
        <line x1="40%" y1="40%" x2="35%" y2="60%" stroke="white" strokeWidth="0.5" />
        <line x1="80%" y1="10%" x2="70%" y2="30%" stroke="white" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
