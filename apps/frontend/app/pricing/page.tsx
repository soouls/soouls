'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useUser } from '@clerk/nextjs';
import { trpc } from '../../src/utils/trpc';

export default function PricingPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(false);
  const { data: onboardingStatus, refetch } = trpc.private.home.getOnboardingStatus.useQuery(undefined, {
    enabled: isLoaded && isSignedIn,
  });

  // Hardcoded for now. A real app might use Vercel headers to check region
  // For demonstration we'll just show the INR and USD toggle or default to INR
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const priceAmount = currency === 'INR' ? '₹199' : '$3.99';
  const planId = currency === 'INR' 
    ? process.env.NEXT_PUBLIC_RAZORPAY_PLAN_ID_INR 
    : process.env.NEXT_PUBLIC_RAZORPAY_PLAN_ID_USD;

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      alert('Please sign in to subscribe.');
      return;
    }

    if (!planId) {
      alert('Pricing plans are not fully configured yet.');
      return;
    }

    try {
      setLoading(true);
      // Call our backend to create a subscription
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/payments/create-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          userId: user.id
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to create subscription');
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        subscription_id: data.subscriptionId,
        name: 'Soouls Premium',
        description: 'Monthly Subscription',
        image: '/logo.png', // Add a valid logo path
        handler: function (response: any) {
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          // You might want to refresh the page or user session here
          window.location.reload();
        },
        prefill: {
          name: user.fullName || '',
          email: user.primaryEmailAddress?.emailAddress || '',
        },
        theme: {
          color: '#000000',
        },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp1.open();

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your premium subscription?')) return;
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/payments/cancel-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to cancel');
      alert('Subscription cancelled successfully.');
      await refetch();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const isPremium = onboardingStatus?.planType === 'premium';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden p-8 text-center border border-gray-100">
        <h1 className="text-3xl font-bold mb-2">Soouls Premium</h1>
        
        {isPremium ? (
          <>
            <p className="text-gray-500 mb-6">You are currently on the Premium plan. Thank you for your support!</p>
            <div className="flex items-center justify-center mb-8">
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                Active Subscription
              </span>
            </div>
            <button 
              onClick={handleCancel} 
              disabled={loading}
              className="w-full py-4 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-red-200"
            >
              {loading ? 'Processing...' : 'Cancel Subscription'}
            </button>
            <a href="/home" className="block mt-4 text-gray-500 hover:text-black transition-colors underline">Return to Dashboard</a>
          </>
        ) : (
          <>
            <p className="text-gray-500 mb-6">Unlock all premium features including more clusters and advanced AI usage.</p>
        
        <div className="flex justify-center items-center mb-6 space-x-4">
          <button 
            onClick={() => setCurrency('INR')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${currency === 'INR' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            India (INR)
          </button>
          <button 
            onClick={() => setCurrency('USD')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${currency === 'USD' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            International (USD)
          </button>
        </div>

        <div className="text-5xl font-extrabold mb-8 text-gray-900">
          {priceAmount} <span className="text-lg font-normal text-gray-500">/mo</span>
        </div>

        <ul className="text-left space-y-4 mb-8">
          <li className="flex items-center text-gray-700">
            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            Unlimited Clusters
          </li>
          <li className="flex items-center text-gray-700">
            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            Advanced AI Models
          </li>
          <li className="flex items-center text-gray-700">
            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            Priority Support
          </li>
        </ul>

        <button 
          onClick={handleSubscribe} 
          disabled={!isLoaded || loading}
          className="w-full py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? 'Processing...' : 'Subscribe Now'}
        </button>
        </>
        )}
      </div>
    </div>
  );
}
