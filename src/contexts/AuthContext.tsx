"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.log('Auth initialization timeout, setting loading to false');
        setLoading(false);
        setIsAuthenticated(false);
        setSession(null);
        setUser(null);
      }, 5000); // 5 second timeout

      try {
        // Simple session check with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 3000)
        );
        
        const { data: { session: currentSession }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        clearTimeout(timeout);
        
        if (error) {
          console.error('Error getting session:', error);
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
        } else if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAuthenticated(true);
          console.log('User is authenticated on mount:', currentSession.user.email);
        } else {
          console.log('No active session found');
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        clearTimeout(timeout);
        console.error('Error initializing auth (using fallback):', error);
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Simplified auth listener with error handling
    let subscription: any = null;

    try {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('Auth state change event:', event);
          
          if (event === 'SIGNED_IN' && newSession) {
            console.log('User signed in:', newSession.user.email);
            setSession(newSession);
            setUser(newSession.user);
            setIsAuthenticated(true);
            setLoading(false);
          } 
          else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            setSession(null);
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
          }
          else if (event === 'TOKEN_REFRESHED' && newSession) {
            console.log('Token refreshed for:', newSession.user.email);
            setSession(newSession);
            setUser(newSession.user);
            setIsAuthenticated(true);
            setLoading(false);
          }
        }
      );
      
      subscription = authSubscription;
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setLoading(false);
    }

    // Clean up subscription on unmount
    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Make sure we use localhost for development
      const redirectTo = `http://localhost:3000/auth/callback`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with password:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithPassword,
    signUp,
    signOut,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 