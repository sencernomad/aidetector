import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';

export async function POST(req: Request) {
  try {
    const { priceId, planType } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${DOMAIN}/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/pricing`,
      metadata: {
        planType,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
} 