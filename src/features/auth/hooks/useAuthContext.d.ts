import React from 'react';
import type { AuthState, SignInCredentials, SignUpCredentials } from '../types';
export interface AuthContextValue extends AuthState {
    signIn: (credentials: SignInCredentials) => Promise<{
        error: Error | null;
    }>;
    signUp: (credentials: SignUpCredentials) => Promise<{
        error: Error | null;
    }>;
    signOut: () => Promise<void>;
    refreshSession: () => Promise<void>;
}
export declare const AuthProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useAuthContext: () => AuthContextValue;
