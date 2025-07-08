"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ImageIcon, PercentIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStripe } from "@/lib/stripe";
import { useAuth } from "@/contexts/AuthContext";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  
  // Use the actual auth context
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const plans = [
    {
      name: "Lite",
      description: "For occasional use and personal projects",
      monthlyPriceId: 'price_1RfipSRv8iAshBPvyaGTiksE', // Lite Monthly - $8.99
      annualPriceId: 'price_1RfipvRv8iAshBPv1zBvxuvV',  // Lite Yearly - $59.99
      price: {
        monthly: 8.99,
        annual: 4.99,
        annualTotal: 59.99
      },
      features: [
        isAnnual ? "300 image scans per year" : "20 image scans per month",
        "Basic AI detection",
        "95% accuracy",
        "Email support",
        "Mobile-friendly interface",
        "Detailed analysis reports"
      ],
      cta: "Get Now!",
      popular: false
    },
    {
      name: "Pro",
      description: "For professionals and businesses",
      monthlyPriceId: 'price_1RhqdbRkAhJhRPy1YWqEjit2', // Pro Monthly - $14.99
      annualPriceId: 'price_1RfisoRv8iAshBPv1YWeEdPZ',   // Pro Yearly - $107.88
      price: {
        monthly: 14.99,
        annual: 8.99,
        annualTotal: 107.88
      },
      features: [
        "Everything in Lite plan",
        isAnnual ? "1000 image scans per year" : "100 image scans per month",
        "99% accuracy",
        "24/7 priority support",
        "API access",
        "Batch processing",
        "Advanced analytics dashboard",
        "Custom integration options"
      ],
      cta: "Get Pro!",
      popular: true
    }
  ];

  const handlePlanSelect = async (plan: typeof plans[0]) => {
    // Check authentication status
    if (!isAuthenticated) {
      router.push('/login?from=/pricing');
      return;
    }

    try {
      setLoading(plan.name);
      
      const stripe = await getStripe();
      if (!stripe) throw new Error('Stripe not loaded');

      // Get the correct price ID based on billing interval
      const priceId = isAnnual ? plan.annualPriceId : plan.monthlyPriceId;

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          planType: plan.name,
        }),
      });

      const { sessionId, error } = await response.json();
      if (error) throw new Error(error);

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Sorry, there was an error processing your request. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container mx-auto py-16 px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that's right for you and start detecting AI-generated images today
            </p>
            
            <div className="flex items-center justify-center mt-8">
              <div className="bg-muted p-1 rounded-full flex items-center">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium relative transition-all hover:scale-105 ${
                    isAnnual ? "bg-background shadow-sm" : ""
                  }`}
                  onClick={() => setIsAnnual(true)}
                >
                  Annual
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center">
                    <PercentIcon className="h-3 w-3 mr-0.5" />
                    <span>68% OFF</span>
                  </div>
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                    !isAnnual ? "bg-background shadow-sm" : ""
                  }`}
                  onClick={() => setIsAnnual(false)}
                >
                  Monthly
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`flex flex-col rounded-2xl transition-all hover:scale-105 hover:shadow-xl
                  ${plan.popular ? "border-0 ring-2 ring-fuchsia-500 shadow-2xl relative" : "border hover:border-fuchsia-300"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg animate-gradient">
                    MOST POPULAR
                  </div>
                )}
                {isAnnual && (
                  <div className="absolute top-14 right-6 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    <PercentIcon className="h-3 w-3 inline mr-0.5" />
                    <span>68% OFF</span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      ${isAnnual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      /month
                    </span>
                    {isAnnual && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Billed annually at ${plan.price.annualTotal}/year
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full text-lg font-bold py-6 rounded-full transition-all hover:scale-105
                      ${plan.popular ? "text-white shadow-lg animate-gradient" : "hover:bg-fuchsia-50 hover:border-fuchsia-400 hover:text-fuchsia-600"}`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handlePlanSelect(plan)}
                    disabled={loading === plan.name}
                  >
                    {loading === plan.name ? 'Processing...' : plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-20 text-center">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto grid gap-6 mt-8">
              <div className="text-left">
                <h3 className="font-medium mb-2">Can I upgrade or downgrade my plan?</h3>
                <p className="text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-medium mb-2">Do you offer refunds?</h3>
                <p className="text-muted-foreground">
                  We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team.
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-medium mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards, PayPal, and bank transfers for annual plans.
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-medium mb-2">How accurate is the AI detection?</h3>
                <p className="text-muted-foreground">
                  Our Lite plan offers 95% accuracy, while our Pro plan provides enhanced 99% accuracy with advanced detection algorithms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} AI Scanner. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 