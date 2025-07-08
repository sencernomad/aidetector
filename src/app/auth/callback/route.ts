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
      // Use the same hardcoded values as in the main supabase config
      const supabaseUrl = 'https://uzpwlzdhziiybzbdnasq.supabase.co';
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6cHdsemRoemlpeWJ6YmRuYXNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NjI3OTcsImV4cCI6MjA2MzEzODc5N30.izoU9FesSnPMehNbIa_7cdRuXGwb6RuujF52k1Sa_Z4';
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