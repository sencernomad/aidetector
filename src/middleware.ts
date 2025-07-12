import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This middleware checks authentication before redirecting
export async function middleware(request: NextRequest) {
  // Create a Supabase client using environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // Skip Supabase operations if environment variables are not available
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not found in middleware');
    return NextResponse.next();
  }
  
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