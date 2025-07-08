-- Supabase database setup for Stripe integration
-- Run these commands in Supabase SQL Editor

-- 1. Create user_profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('Lite', 'Pro')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'past_due', 'trialing')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create user_credits table to track scan quotas
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'Lite', 'Pro')),
  total_credits INTEGER DEFAULT 1, -- Free users get 1 scan
  used_credits INTEGER DEFAULT 0,
  credits_reset_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now() + interval '1 month'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create payment_history table
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Update existing scan_results table to reference user_credits
ALTER TABLE public.scan_results 
ADD COLUMN IF NOT EXISTS credit_used BOOLEAN DEFAULT TRUE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_results_user_id ON public.scan_results(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for user_credits
CREATE POLICY "Users can view own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON public.user_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for payment_history
CREATE POLICY "Users can view own payment history" ON public.payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for scan_results
CREATE POLICY "Users can view own scan results" ON public.scan_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan results" ON public.scan_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create initial credits for new user
  INSERT INTO public.user_credits (user_id, plan_type, total_credits, used_credits)
  VALUES (new.id, 'free', 1, 0);
  
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to automatically create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to check if user has available credits
CREATE OR REPLACE FUNCTION public.check_user_credits(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  credits_available INTEGER;
BEGIN
  SELECT (total_credits - used_credits) INTO credits_available
  FROM public.user_credits
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(credits_available, 0) > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to consume a credit
CREATE OR REPLACE FUNCTION public.consume_credit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  credits_available INTEGER;
BEGIN
  SELECT (total_credits - used_credits) INTO credits_available
  FROM public.user_credits
  WHERE user_id = user_uuid;
  
  IF COALESCE(credits_available, 0) > 0 THEN
    UPDATE public.user_credits
    SET used_credits = used_credits + 1,
        updated_at = now()
    WHERE user_id = user_uuid;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user subscription
CREATE OR REPLACE FUNCTION public.update_user_subscription(
  user_uuid UUID,
  stripe_sub_id TEXT,
  stripe_price_id TEXT,
  plan_name TEXT,
  sub_status TEXT,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE
)
RETURNS void AS $$
DECLARE
  credits_to_assign INTEGER;
BEGIN
  -- Determine credits based on plan
  IF plan_name = 'Lite' THEN
    credits_to_assign := 300; -- Annual credits or monthly equivalent
  ELSIF plan_name = 'Pro' THEN
    credits_to_assign := 1000; -- Annual credits or monthly equivalent
  ELSE
    credits_to_assign := 1; -- Default free tier
  END IF;

  -- Update or insert subscription
  INSERT INTO public.subscriptions (
    user_id, stripe_subscription_id, stripe_price_id, plan_type, status,
    current_period_start, current_period_end
  )
  VALUES (
    user_uuid, stripe_sub_id, stripe_price_id, plan_name, sub_status,
    period_start, period_end
  )
  ON CONFLICT (stripe_subscription_id)
  DO UPDATE SET
    plan_type = EXCLUDED.plan_type,
    status = EXCLUDED.status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    updated_at = now();

  -- Update user credits
  UPDATE public.user_credits
  SET 
    plan_type = plan_name,
    total_credits = credits_to_assign,
    -- Reset used credits if it's a new billing period
    used_credits = CASE 
      WHEN credits_reset_date < now() THEN 0 
      ELSE used_credits 
    END,
    credits_reset_date = period_end,
    updated_at = now()
  WHERE user_id = user_uuid;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 