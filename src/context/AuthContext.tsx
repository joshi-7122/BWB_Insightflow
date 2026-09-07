import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, createClient } from '@supabase/supabase-js';
import { supabase as defaultSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null; needsConfirmation?: boolean }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isDemoMode: boolean;
  switchToDemoMode: () => void;
  configureSupabaseCredentials: (url: string, anonKey: string) => void;
  supabaseConfigured: boolean;
}

const MOCK_USER: User = {
  id: 'demo-user-123',
  app_metadata: {},
  user_metadata: { full_name: 'Alex Rivera', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'alex.rivera@insightflow.io',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
} as User;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [supabaseClient, setSupabaseClient] = useState(() => defaultSupabase);
  const [supabaseConfigured, setSupabaseConfigured] = useState<boolean>(() => isSupabaseConfigured());

  // Initialize session and auth state listener
  useEffect(() => {
    // Check if custom credentials are saved in localStorage
    const customUrl = localStorage.getItem('insightflow_supabase_url');
    const customKey = localStorage.getItem('insightflow_supabase_key');

    let activeClient = defaultSupabase;
    let configured = isSupabaseConfigured();

    if (customUrl && customKey) {
      activeClient = createClient(customUrl, customKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
      configured = true;
      setSupabaseClient(activeClient);
      setSupabaseConfigured(true);
    }

    if (!configured) {
      // Default to demo mode if no real credentials present
      setIsDemoMode(true);
      setUser(MOCK_USER);
      setSession({
        access_token: 'demo-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'demo-refresh',
        user: MOCK_USER,
      } as Session);
      setLoading(false);
      return;
    }

    // Get active Supabase session
    activeClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = activeClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsDemoMode(false);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const configureSupabaseCredentials = (url: string, anonKey: string) => {
    localStorage.setItem('insightflow_supabase_url', url);
    localStorage.setItem('insightflow_supabase_key', anonKey);

    const client = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });

    setSupabaseClient(client);
    setSupabaseConfigured(true);
    setIsDemoMode(false);

    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
  };

  const switchToDemoMode = () => {
    setIsDemoMode(true);
    setUser(MOCK_USER);
    setSession({
      access_token: 'demo-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'demo-refresh',
      user: MOCK_USER,
    } as Session);
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (isDemoMode && !supabaseConfigured) {
      const mockUser = {
        ...MOCK_USER,
        email,
        user_metadata: { full_name: email.split('@')[0] },
      } as User;
      setUser(mockUser);
      setSession({ access_token: 'demo-token', user: mockUser } as Session);
      return { error: null };
    }

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      setUser(data.user);
      setSession(data.session);
      setIsDemoMode(false);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    if (isDemoMode && !supabaseConfigured) {
      const mockUser = {
        ...MOCK_USER,
        email,
        user_metadata: { full_name: fullName || email.split('@')[0] },
      } as User;
      setUser(mockUser);
      setSession({ access_token: 'demo-token', user: mockUser } as Session);
      return { error: null };
    }

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0],
          },
        },
      });

      if (error) return { error };

      if (data.user) {
        // Create user profile record in public.profiles table
        const { error: profileError } = await supabaseClient.from('profiles').upsert({
          id: data.user.id,
          display_name: fullName || email.split('@')[0],
          updated_at: new Date().toISOString(),
        });
        if (profileError) {
          console.warn('[InsightFlow] Could not save profile:', profileError.message);
        }
      }

      const needsConfirmation = !data.session && !!data.user;
      if (data.session) {
        setUser(data.user);
        setSession(data.session);
        setIsDemoMode(false);
      }

      return { error: null, needsConfirmation };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signInWithGoogle = async () => {
    if (isDemoMode && !supabaseConfigured) {
      setUser(MOCK_USER);
      return { error: null };
    }

    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    if (supabaseConfigured && !isDemoMode) {
      await supabaseClient.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        isDemoMode,
        switchToDemoMode,
        configureSupabaseCredentials,
        supabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
