'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useCallback, useEffect, useState } from 'react';
import { trpc } from '../../src/utils/trpc';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PaymentStatus = 'idle' | 'creating' | 'paying' | 'verifying' | 'success' | 'failed';

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

const PLANS = {
  INR: {
    amount: 19900,
    display: '₹199',
    currency: 'INR',
    label: 'India (INR)',
    planIdMonthly: process.env.NEXT_PUBLIC_RAZORPAY_SOUL_PLAN_ID_MONTHLY_INR || '',
    planIdAnnual: process.env.NEXT_PUBLIC_RAZORPAY_SOUL_PLAN_ID_ANNUAL_INR || '',
  },
  USD: {
    amount: 399,
    display: '$3.99',
    currency: 'USD',
    label: 'International (USD)',
    planIdMonthly: process.env.NEXT_PUBLIC_RAZORPAY_SOUL_PLAN_ID_MONTHLY_USD || '',
    planIdAnnual: process.env.NEXT_PUBLIC_RAZORPAY_SOUL_PLAN_ID_ANNUAL_USD || '',
  },
} as const;

import { Suspense } from 'react';

export default function PricingModalWrapper() {
  return (
    <Suspense fallback={null}>
      <PricingModal />
    </Suspense>
  );
}

function PricingModal() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isOpen = searchParams.get('showPricing') === 'true';
  const isOnboardingCompleted = searchParams.get('onboardingCompleted') === 'true';

  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    // Read currency cookie on mount to handle geolocation pricing
    const match = document.cookie.match(/(^| )currency=([^;]+)/);
    if (match && match[2] === 'USD') {
      setCurrency('USD');
    } else {
      setCurrency('INR');
    }
  }, []);

  const { data: onboardingStatus, refetch } = trpc.private.home.getOnboardingStatus.useQuery(
    undefined,
    { enabled: isLoaded && isSignedIn },
  );

  const plan = PLANS[currency];
  const isPremium = onboardingStatus?.planType === 'premium';
  const isTrialActive = onboardingStatus?.isTrialActive;
  const loading = status !== 'idle' && status !== 'success' && status !== 'failed';

  const close = () => {
    // Remove showPricing from url
    const params = new URLSearchParams(searchParams.toString());
    params.delete('showPricing');
    params.delete('onboardingCompleted');
    router.replace(`${pathname}?${params.toString()}`);
    // Reset state
    setStatus('idle');
    setErrorMsg('');
  };

  const handleSubscribe = useCallback(async () => {
    if (!isSignedIn || !user) {
      router.push('/sign-in');
      return;
    }

    if (!RAZORPAY_KEY) {
      setErrorMsg('Payment gateway is not configured. Please contact support.');
      return;
    }

    if (!window.Razorpay) {
      setErrorMsg('Payment SDK is still loading. Please wait a moment and try again.');
      return;
    }

    const planId = billingCycle === 'annual' ? plan.planIdAnnual : plan.planIdMonthly;

    if (!planId) {
      setErrorMsg(
        'Subscription plan not configured yet. Please configure RAZORPAY_SOUL_PLAN_ID in the environment.',
      );
      return;
    }

    setErrorMsg('');
    setStatus('creating');

    try {
      const token = await getToken();
      const subRes = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      const subData = await subRes.json();
      if (!subRes.ok || !subData.success) {
        throw new Error(subData.message || 'Failed to create subscription');
      }

      setStatus('paying');

      const options = {
        key: RAZORPAY_KEY,
        name: 'Soouls',
        description: `Premium ${billingCycle === 'annual' ? 'Annual' : 'Monthly'} Subscription`,
        image: '/logo.png',
        subscription_id: subData.subscriptionId,
        handler: async (response: any) => {
          setStatus('verifying');
          try {
            const token = await getToken();
            const verifyRes = await fetch('/api/payments/verify-subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ ...response }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.message || 'Subscription verification failed');
            }

            setStatus('success');
            await refetch();
          } catch (verifyError: any) {
            setStatus('failed');
            setErrorMsg(verifyError.message || 'Payment received but verification failed.');
          }
        },
        prefill: {
          name: user.fullName || '',
          email: user.primaryEmailAddress?.emailAddress || '',
        },
        notes: { userId: user.id },
        theme: { color: '#F97316' },
        modal: { ondismiss: () => setStatus('idle') },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setStatus('failed');
        setErrorMsg(response.error?.description || 'Payment failed. Please try again.');
      });
      rzp.open();
    } catch (error: any) {
      setStatus('failed');
      setErrorMsg(error.message || 'Something went wrong. Please try again.');
    }
  }, [isSignedIn, user, plan, refetch, billingCycle, getToken]);

  const handleCancel = useCallback(async () => {
    if (!window.confirm('Are you sure you want to cancel your premium subscription?')) return;
    setStatus('creating');
    setErrorMsg('');
    try {
      const token = await getToken();
      const res = await fetch('/api/payments/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to cancel');
      setStatus('idle');
      await refetch();
    } catch (e: any) {
      setStatus('failed');
      setErrorMsg(e.message || 'Failed to cancel subscription.');
    }
  }, [getToken, refetch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="bg-[#FDFBF7] w-full max-w-4xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col my-8">
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 p-2 text-gray-500 hover:text-gray-900 bg-white/50 hover:bg-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-12 pb-6 text-center border-b border-gray-100 relative">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-orange-100/30 rounded-full blur-[80px] -z-10 pointer-events-none" />

          <h2 className="text-3xl md:text-4xl font-extrabold font-serif mb-4 tracking-tight">
            {isOnboardingCompleted ? 'Please Upgrade' : 'Choose your depth'}
          </h2>
          {isOnboardingCompleted && (
            <p className="text-gray-600 mb-6 max-w-lg mx-auto leading-relaxed">
              Unlock the full experience. The main app remains free forever, but premium features
              are limited to a 14-day trial. Once the trial ends, these features will only be
              accessible with a subscription.
            </p>
          )}

          <div className="inline-flex items-center p-1 bg-gray-100/50 backdrop-blur-sm rounded-full mb-6 border border-gray-200/50">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Annual
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${billingCycle === 'annual' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'}`}
              >
                Save 20%
              </span>
            </button>
          </div>

          {errorMsg && status === 'failed' && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
              {errorMsg}
            </div>
          )}
          {status === 'success' && (
            <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700">
              <h3 className="font-bold">🎉 Payment Successful!</h3>
              <p className="text-sm">Welcome to Premium. You can now close this window.</p>
            </div>
          )}
        </div>

        <div className="p-8 md:p-12 bg-white/50 flex-1 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch text-left">
            {/* Node (Free) */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-2xl font-bold">Node</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold font-serif tracking-tight">$0</span>
                <span className="text-gray-400 text-sm ml-1 font-medium">/mo</span>
              </div>
              <button
                onClick={close}
                className="w-full py-3 rounded-full border border-gray-200 text-gray-900 font-bold hover:bg-gray-50 transition-colors mb-6 text-xs uppercase tracking-widest"
              >
                Continue Free
              </button>
              <ul className="space-y-3 text-sm text-gray-600 mt-auto font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">✓</span> Unlimited text entries
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">✓</span> Spatial Canvas (10 active)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">✓</span> 7-day River of Time
                </li>
                <li className="flex items-start gap-2 opacity-40">
                  <span className="text-gray-300 font-bold">✓</span>{' '}
                  <span className="line-through">Sunday Review</span>
                </li>
              </ul>
            </div>

            {/* Soul (Premium) */}
            <div className="relative bg-[#FFF8F3] border-2 border-[#FFD9C0] rounded-3xl p-6 flex flex-col shadow-md overflow-hidden">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                Recommended
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-2xl font-bold">Soul</h3>
                <span className="text-orange-400 text-xl">✦</span>
              </div>
              <div className="mb-6 flex flex-col">
                <div>
                  <span className="text-4xl font-extrabold font-serif tracking-tight">
                    {billingCycle === 'annual'
                      ? currency === 'INR'
                        ? '₹159'
                        : '$3.19'
                      : plan.display}
                  </span>
                  <span className="text-gray-400 text-sm ml-1 font-medium">/mo</span>
                </div>
              </div>

              {isPremium ? (
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-white text-red-500 border border-red-200 font-bold hover:bg-red-50 transition-colors mb-6 text-xs tracking-widest uppercase"
                >
                  Cancel Subscription
                </button>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={loading || !isLoaded}
                  className="w-full py-3 rounded-full bg-[#E5926B] text-white font-bold hover:bg-[#d68560] transition-colors mb-6 shadow-sm text-xs tracking-widest uppercase"
                >
                  {loading
                    ? 'Processing...'
                    : isTrialActive
                      ? 'Extend Premium'
                      : 'Start 14-Days Free'}
                </button>
              )}

              <ul className="space-y-3 text-sm text-gray-600 mt-auto font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">✓</span> Everything in Node
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">✓</span> Advanced AI Weaver
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">✓</span> Unlimited Thought Clusters
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">✓</span> Sunday Review
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
