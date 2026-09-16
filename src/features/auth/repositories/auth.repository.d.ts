import type { AuthResponse, UserResponse, Subscription } from '@supabase/supabase-js';
import type { SignInCredentials, SignUpCredentials, UserProfile } from '../types';
export declare class AuthRepository {
    signInWithPassword(credentials: SignInCredentials): Promise<AuthResponse>;
    signUp(credentials: SignUpCredentials): Promise<AuthResponse>;
    signOut(): Promise<{
        error: Error | null;
    }>;
    getSession(): Promise<{
        data: {
            session: import("@supabase/auth-js").Session;
        };
        error: null;
    } | {
        data: {
            session: null;
        };
        error: import("@supabase/auth-js").AuthError;
    } | {
        data: {
            session: null;
        };
        error: null;
    }>;
    getUser(): Promise<UserResponse>;
    onAuthStateChange(callback: (event: string, session: unknown) => void): {
        data: {
            subscription: Subscription;
        };
    };
    getProfile(userId: string): Promise<{
        profile: UserProfile | null;
        error: Error | null;
    }>;
}
export declare const authRepository: AuthRepository;
