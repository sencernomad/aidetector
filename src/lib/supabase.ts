"use client";

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Build-time safe Supabase client
function createSupabaseClient() {
  // Use environment variables for production
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

  console.log('Supabase config:', { supabaseUrl, supabaseAnonKey: supabaseAnonKey !== 'placeholder_key' ? 'EXISTS' : 'MISSING' });

  // Create client even with placeholder values for build-time compatibility
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Export Supabase client
export const supabase = createSupabaseClient();

export const signInWithGoogle = async () => {
  const currentPath = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const from = searchParams.get('from') || '/scanner';
  
  // Build redirect URL with the from parameter
  const redirectUrl = `${window.location.origin}/auth/callback?from=${encodeURIComponent(from)}`;
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    },
  });
  
  if (error) {
    console.error('Error signing in with Google:', error);
    return { error };
  }
  
  return { error: null };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

export const saveScanResult = async (userId: string, imageUrl: string, result: { isAI: boolean; confidence: number; raw: string }) => {
  const { data, error } = await supabase
    .from('scan_results')
    .insert([
      {
        user_id: userId,
        image_url: imageUrl,
        is_ai: result.isAI,
        confidence: result.confidence,
        raw_result: result.raw,
        created_at: new Date().toISOString()
      }
    ])
    .select();

  if (error) {
    console.error('Error saving scan result:', error);
    throw error;
  }

  return data;
};

export const getScanHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('scan_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching scan history:', error);
    throw error;
  }

  return data;
};