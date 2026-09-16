import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { authService } from '../services/auth.service';
import type { AuthState, SignInCredentials, SignUpCredentials } from '../types';

export interface AuthContextValue extends AuthState {
  signIn: (credentials: SignInCredentials) => Promise<{ error: Error | null }>;
  signUp: (credentials: SignUpCredentials) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    error: null,
  });

  const refreshSession = async () => {
    try {
      const { user, session, profile } = await authService.getCurrentSession();
      setState({
        user,
        session,
        profile,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error('Failed to load session'),
      }));
    }
  };

  useEffect(() => {
    refreshSession();

    const { data: authListener } = authService.onAuthStateChange(async (_event, session) => {
      if (session) {
        await refreshSession();
      } else {
        setState({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (credentials: SignInCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const result = await authService.signIn(credentials);
    if (result.error) {
      setState((prev) => ({ ...prev, isLoading: false, error: result.error }));
      return { error: result.error };
    }
    setState({
      user: result.user,
      session: result.session,
      profile: result.profile,
      isLoading: false,
      error: null,
    });
    return { error: null };
  };

  const signUp = async (credentials: SignUpCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const result = await authService.signUp(credentials);
    if (result.error) {
      setState((prev) => ({ ...prev, isLoading: false, error: result.error }));
      return { error: result.error };
    }
    setState((prev) => ({
      ...prev,
      user: result.user,
      session: result.session,
      isLoading: false,
      error: null,
    }));
    return { error: null };
  };

  const signOut = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    await authService.signOut();
    setState({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      error: null,
    });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn,
      signUp,
      signOut,
      refreshSession,
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
