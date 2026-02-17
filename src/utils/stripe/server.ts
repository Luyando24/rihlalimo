import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-12-15.clover' as any, // Cast to any to avoid type issues if minor version mismatch
  appInfo: {
    name: 'Rihla Limo',
    version: '0.1.0',
  },
})
