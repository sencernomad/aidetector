import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This middleware checks authentication before redirecting
export async function middleware(request: NextRequest) {
  // Create a Supabase client with the same hardcoded values
  const supabaseUrl = 'https://uzpwlzdhziiybzbdnasq.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6cHdsemRoemlpeWJ6YmRuYXNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NjI3OTcsImV4cCI6MjA2MzEzODc5N30.izoU9FesSnPMehNbIa_7cdRuXGwb6RuujF52k1Sa_Z4';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Check if we're trying to access a protected route
  if (request.nextUrl.pathname === '/create') {
    // Get the auth cookie from the request
    const cookies = request.cookies;
    const supabaseCookie = cookies.get('sb-access-token')?.value || 
                           cookies.get('sb-refresh-token')?.value ||
                           cookies.get('supabase-auth-token')?.value;

    // If there's no auth cookie, redirect to login
    if (!supabaseCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Specify paths for the middleware to run on
export const config = {
  matcher: ['/create/:path*'],
}; 