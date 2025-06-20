"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const { signInWithGoogle, signInWithPassword, signUp, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Prevent getting stuck on loading screen if auth state takes too long
    const timer = setTimeout(() => {
      if (loading) {
        setInitialLoading(false);
      }
    }, 2500); // Wait for a maximum of 2.5 seconds

    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      setInitialLoading(false);
    }
  }, [loading]);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signInWithPassword(email, password);
      }
      // On success, AuthProvider will redirect or update state
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  if (initialLoading && !isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin mr-2 h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 flex items-center justify-center p-4">
        {isAuthenticated ? (
          <div className="text-center p-8 max-w-md w-full bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Successfully Signed In!</h2>
            <p className="text-muted-foreground mb-6">Welcome back. Choose where you want to go:</p>
            <div className="space-y-3">
              <Button onClick={() => window.location.href = '/scanner'} className="w-full">
                Scan a New Image
              </Button>
              <Button onClick={() => window.location.href = '/profile'} variant="outline" className="w-full">
                View My Profile
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="ghost" className="w-full">
                Go to Homepage
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg animate-fade-in">
            <div className="text-center">
              <Link href="/" className="inline-block mb-6">
                 <Image 
                    src="/applogo.png"
                    alt="AI Scanner Logo"
                    width={150}
                    height={40}
                    className="h-10 w-auto"
                  />
              </Link>
              <h1 className="text-2xl font-bold">{isSignUp ? 'Create an Account' : 'Sign in to AI Scanner'}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Access powerful AI image detection tools
              </p>
            </div>

            <form onSubmit={handleAuthAction} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              {error && <p className="text-red-500 text-sm animate-shake">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></div>
                    Processing...
                  </div>
                ) : (isSignUp ? 'Sign Up' : 'Sign In')}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button 
              onClick={signInWithGoogle} 
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="h-5 w-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </Button>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="text-primary font-semibold hover:underline">
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            <div className="mt-4 text-center text-xs text-muted-foreground">
              <p>
                By signing in or creating an account, you agree to our 
                <Link href="/terms" className="underline hover:text-primary mx-1">Terms of Service</Link> and 
                <Link href="/privacy" className="underline hover:text-primary ml-1">Privacy Policy</Link>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 