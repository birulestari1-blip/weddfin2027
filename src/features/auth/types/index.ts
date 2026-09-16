import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { Tables } from '@/types/database.types';

export type AuthUser = User;
export type AuthSession = Session;
export type UserProfile = Tables<'profiles'>;
export type Tenant = Tables<'tenants'>;

export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  session: AuthSession | null;
  isLoading: boolean;
  error: AuthError | Error | null;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface ResetPasswordPayload {
  email: string;
}
