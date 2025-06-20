"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, signInWithGoogle, signOut as supabaseSignOut, getCurrentUser } from '@/lib/supabase';
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
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
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
        console.error('Error initializing auth:', error);
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change event:', event);
        
        if (event === 'SIGNED_IN' && newSession) {
          console.log('User signed in:', newSession.user.email);
          setSession(newSession);
          setUser(newSession.user);
          setIsAuthenticated(true);
        } 
        else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
        }
        else if (event === 'USER_UPDATED' && newSession) {
          console.log('User updated:', newSession.user.email);
          setSession(newSession);
          setUser(newSession.user);
          setIsAuthenticated(true);
        }
        else if (event === 'TOKEN_REFRESHED' && newSession) {
          console.log('Token refreshed for:', newSession.user.email);
          setSession(newSession);
          setUser(newSession.user);
          setIsAuthenticated(true);
        }
        
        setLoading(false);
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      // You might want to show a notification to the user
    } finally {
      setLoading(false);
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // On successful sign-in, onAuthStateChange will trigger and handle the session
    } catch (error) {
      console.error('Error signing in with password:', error);
      throw error; // Re-throw to be caught in the UI
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
      // On successful sign-up, onAuthStateChange will trigger if email confirmation is off.
      // If email confirmation is on, the user will be in a pending state.
      // You might want to show a "Check your email" message here.
    } catch (error) {
      console.error('Error signing up:', error);
      throw error; // Re-throw to be caught in the UI
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/'); // Redirect to home page after sign out
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