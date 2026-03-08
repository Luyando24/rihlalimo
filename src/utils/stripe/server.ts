import Stripe from 'stripe'

// Remove any hidden non-ASCII characters or whitespace that might have been copied into the environment variable
const cleanSecretKey = (process.env.STRIPE_SECRET_KEY || 'sk_test_mock').replace(/[^\x20-\x7E]/g, '').trim()

export const stripe = new Stripe(cleanSecretKey, {
  apiVersion: '2025-12-15.clover' as any, // Cast to any to avoid type issues if minor version mismatch
  appInfo: {
    name: 'Rihla Limo',
    version: '0.1.0',
  },
  httpClient: Stripe.createFetchHttpClient(),
})
