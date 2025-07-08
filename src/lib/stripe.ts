import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Frontend Stripe instance
export const getStripe = () => {
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
  return loadStripe(stripePublishableKey);
};

// Backend Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil', // Use the latest API version
}); 