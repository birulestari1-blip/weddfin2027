import { supabase } from '@/lib/supabase';
import type { AuthResponse, UserResponse, Subscription } from '@supabase/supabase-js';
import type { SignInCredentials, SignUpCredentials, UserProfile } from '../types';

export class AuthRepository {
  async signInWithPassword(credentials: SignInCredentials): Promise<AuthResponse> {
    return await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    return await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.fullName,
          phone_number: credentials.phoneNumber,
        },
      },
    });
  }

  async resetPasswordForEmail(email: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  }

  async signOut(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  async getSession() {
    return await supabase.auth.getSession();
  }

  async getUser(): Promise<UserResponse> {
    return await supabase.auth.getUser();
  }

  onAuthStateChange(callback: (event: string, session: unknown) => void): {
    data: { subscription: Subscription };
  } {
    return supabase.auth.onAuthStateChange(callback);
  }

  async getProfile(userId: string): Promise<{ profile: UserProfile | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      return { profile: null, error };
    }

    return { profile: data, error: null };
  }
}

export const authRepository = new AuthRepository();
