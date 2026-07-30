import { cookies } from 'next/headers';
import { type Currency, PRICING } from '../../../src/lib/pricing';

export default async function PricingSection() {
  const cookieStore = await cookies();
  const currencyVal = cookieStore.get('currency')?.value || 'USD';
  const currency: Currency =
    currencyVal === 'INR' || currencyVal === 'USD' ? (currencyVal as Currency) : 'USD';

  const plan = PRICING[currency];

  return (
    <div className="pricing-section flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md max-w-sm mx-auto my-12 border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-4">Premium Plan</h2>
      <div className="text-4xl font-extrabold mb-6">
        {plan.symbol}
        {plan.amount} <span className="text-lg text-gray-500 font-normal">/ month</span>
      </div>
      <ul className="text-left mb-8 space-y-2">
        <li className="flex items-center gap-2">✓ All premium features</li>
        <li className="flex items-center gap-2">✓ Priority support</li>
        <li className="flex items-center gap-2">✓ Unrestricted access</li>
      </ul>
      <form action="/api/payments/create-order" method="POST" className="w-full">
        <input type="hidden" name="currency" value={currency} />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-colors w-full"
        >
          Upgrade Now
        </button>
      </form>
    </div>
  );
}
