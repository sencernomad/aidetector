import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Received Stripe event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        // TODO: Update user's subscription status in your database
        // You can access session.customer, session.subscription, etc.
        break;

      case 'customer.subscription.created':
        const newSubscription = event.data.object;
        console.log('Subscription created:', newSubscription.id);
        // TODO: Handle new subscription
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        console.log('Subscription updated:', updatedSubscription.id);
        // TODO: Handle subscription updates (plan changes, etc.)
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('Subscription cancelled:', deletedSubscription.id);
        // TODO: Handle subscription cancellation
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('Payment succeeded:', invoice.id);
        // TODO: Handle successful payment
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log('Payment failed:', failedInvoice.id);
        // TODO: Handle failed payment
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
} 