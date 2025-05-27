"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const { signIn, isAuthenticated, loading } = useAuth();
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);

  // Simple direct navigation to a specific route
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  useEffect(() => {
    // Only show redirect message if authenticated
    if (isAuthenticated && !loading) {
      setShowRedirectMessage(true);
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin mr-2 h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/applogo.png"
              alt="AI Scanner Logo"
              width={150}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition">Home</Link>
            <Link href="/create" className="text-muted-foreground hover:text-foreground transition">Scanner</Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        {isAuthenticated ? (
          <div className="text-center p-6 max-w-md w-full">
            <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md mb-6">
              <div className="flex items-center justify-center mb-2">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="font-medium">You are already signed in</span>
              </div>
              <p className="text-sm">Choose where you want to go:</p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigateTo('/create')} 
                className="w-full bg-black hover:bg-gray-800 text-white"
              >
                Upload & Scan Images
              </Button>
              
              <Button 
                onClick={() => navigateTo('/profile')} 
                variant="outline"
                className="w-full"
              >
                My Profile
              </Button>
              
              <Button 
                onClick={() => navigateTo('/')} 
                variant="outline"
                className="w-full"
              >
                Home Page
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Sign in to AI Scanner</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Access powerful AI image detection tools
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={signIn} 
                className="w-full flex items-center justify-center gap-2"
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
            </div>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                By signing in, you agree to our 
                <Link href="/terms" className="text-primary ml-1">Terms</Link> and 
                <Link href="/privacy" className="text-primary ml-1">Privacy Policy</Link>
              </p>
            </div>
          </div>
        )}
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