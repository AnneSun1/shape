import { auth } from '@/lib/supabase';
import { apiClient } from './apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: string;
  email: string;
  access_token: string;
  bearer_token: string;
  message: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface SupabaseUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data, error } = await auth.signIn(credentials.email, credentials.password);
    
    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Login failed - no user or session returned');
    }

    // Set the access token for API calls
    apiClient.setAuthToken(data.session.access_token);

    return {
      user_id: data.user.id,
      email: data.user.email!,
      access_token: data.session.access_token,
      bearer_token: data.session.access_token,
      message: 'Login successful',
    };
  }

  async signup(credentials: SignupRequest): Promise<LoginResponse> {
    const { data, error } = await auth.signUp(credentials.email, credentials.password);
    
    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Signup failed - no user or session returned');
    }

    // Set the access token for API calls
    apiClient.setAuthToken(data.session.access_token);

    return {
      user_id: data.user.id,
      email: data.user.email!,
      access_token: data.session.access_token,
      bearer_token: data.session.access_token,
      message: 'Signup successful',
    };
  }

  async testAuth(): Promise<{ authenticated: boolean; user_id?: string }> {
    try {
      const { user, error } = await auth.getCurrentUser();
      
      if (error || !user) {
        return { authenticated: false };
      }

      return { 
        authenticated: true, 
        user_id: user.id 
      };
    } catch (error) {
      return { authenticated: false };
    }
  }

  async logout(): Promise<void> {
    const { error } = await auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }

    // Clear the API client token
    apiClient.setAuthToken('');
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const { user } = await auth.getCurrentUser();
      return !!user;
    } catch {
      return false;
    }
  }

  async getCurrentUser(): Promise<SupabaseUser | null> {
    try {
      const { user, error } = await auth.getCurrentUser();
      
      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email!,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
    } catch {
      return null;
    }
  }

  async getSession() {
    return await auth.getSession();
  }
}

export const authService = new AuthService();
