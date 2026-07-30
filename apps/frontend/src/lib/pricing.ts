export const PRICING = {
  INR: {
    currency: 'INR',
    amount: 200,
    symbol: '₹',
  },
  USD: {
    currency: 'USD',
    amount: 3.99,
    symbol: '$',
  },
} as const;

export type Currency = keyof typeof PRICING;
