import { AuthRepository } from '../repositories/auth.repository';
import type { SignInCredentials, SignUpCredentials, UserProfile, AuthUser, AuthSession } from '../types';
export declare class AuthService {
    private readonly repo;
    constructor(repo?: AuthRepository);
    signIn(credentials: SignInCredentials): Promise<{
        user: AuthUser | null;
        session: AuthSession | null;
        profile: UserProfile | null;
        error: Error | null;
    }>;
    signUp(credentials: SignUpCredentials): Promise<{
        user: AuthUser | null;
        session: AuthSession | null;
        error: Error | null;
    }>;
    signOut(): Promise<{
        error: Error | null;
    }>;
    getCurrentSession(): Promise<{
        user: AuthUser | null;
        session: AuthSession | null;
        profile: UserProfile | null;
    }>;
    onAuthStateChange(callback: (event: string, session: unknown) => void): {
        data: {
            subscription: import("@supabase/auth-js").Subscription;
        };
    };
}
export declare const authService: AuthService;
