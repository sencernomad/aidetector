import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // Redirect to /scanner after successful login
  const redirectTarget = '/scanner';
  
  console.log('Auth callback received. Will redirect to:', redirectTarget);

  if (code) {
    try {
      // Use environment variables for Supabase configuration
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase environment variables in auth callback');
        return NextResponse.redirect(new URL('/', requestUrl.origin));
      }
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        // If there's an error, redirect to home
        return NextResponse.redirect(new URL('/', requestUrl.origin));
      }
      
      console.log('Successfully exchanged code for session');
    } catch (error) {
      console.error('Exception during auth code exchange:', error);
      return NextResponse.redirect(new URL('/', requestUrl.origin));
    }
  }

  // Add a cache-busting parameter to avoid browser caching issues
  const redirectUrl = new URL(redirectTarget, requestUrl.origin);
  redirectUrl.searchParams.set('t', Date.now().toString());
  
  return NextResponse.redirect(redirectUrl);
} 