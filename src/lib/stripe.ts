import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Frontend Stripe instance
export const getStripe = () => {
  const stripePublishableKey = "pk_live_51QcmHGRv8iAshBPv3paps9LK55bARyH68V9Ws1Qs4xe6DhBYYrcZBTb25bknUKiIx8wInKKRVbgxMpKmRQLvxndx00N6ncZchM";
  return loadStripe(stripePublishableKey);
};

// Backend Stripe instance
export const stripe = new Stripe("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", {
  apiVersion: '2025-05-28.basil', // Use the latest API version
}); 