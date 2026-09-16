import { authRepository, AuthRepository } from '../repositories/auth.repository';
import { signInSchema, signUpSchema, resetPasswordSchema } from '../schemas/auth.schema';
import type { SignInCredentials, SignUpCredentials, ResetPasswordPayload, UserProfile, AuthUser, AuthSession } from '../types';

export class AuthService {
  constructor(private readonly repo: AuthRepository = authRepository) {}

  async signIn(credentials: SignInCredentials): Promise<{
    user: AuthUser | null;
    session: AuthSession | null;
    profile: UserProfile | null;
    error: Error | null;
  }> {
    // Validate schema
    const validation = signInSchema.safeParse(credentials);
    if (!validation.success) {
      return {
        user: null,
        session: null,
        profile: null,
        error: new Error(validation.error.errors[0]?.message || 'Invalid login credentials'),
      };
    }

    const { data, error } = await this.repo.signInWithPassword(credentials);
    if (error || !data.user) {
      return {
        user: null,
        session: null,
        profile: null,
        error: error || new Error('Authentication failed'),
      };
    }

    // Retrieve user profile
    const { profile } = await this.repo.getProfile(data.user.id);

    return {
      user: data.user,
      session: data.session,
      profile,
      error: null,
    };
  }

  async signUp(credentials: SignUpCredentials): Promise<{
    user: AuthUser | null;
    session: AuthSession | null;
    error: Error | null;
  }> {
    const validation = signUpSchema.safeParse(credentials);
    if (!validation.success) {
      return {
        user: null,
        session: null,
        error: new Error(validation.error.errors[0]?.message || 'Invalid registration details'),
      };
    }

    const { data, error } = await this.repo.signUp(credentials);
    if (error) {
      return { user: null, session: null, error };
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  }

  async signOut(): Promise<{ error: Error | null }> {
    return await this.repo.signOut();
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<{ error: Error | null }> {
    const validation = resetPasswordSchema.safeParse(payload);
    if (!validation.success) {
      return { error: new Error(validation.error.errors[0]?.message || 'Invalid email') };
    }
    return await this.repo.resetPasswordForEmail(payload.email);
  }

  async getCurrentSession(): Promise<{
    user: AuthUser | null;
    session: AuthSession | null;
    profile: UserProfile | null;
  }> {
    const { data } = await this.repo.getSession();
    if (!data.session?.user) {
      return { user: null, session: null, profile: null };
    }

    const { profile } = await this.repo.getProfile(data.session.user.id);
    return {
      user: data.session.user,
      session: data.session,
      profile,
    };
  }

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return this.repo.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();
