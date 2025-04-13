
import { User } from "@supabase/supabase-js";

/**
 * Helper function to determine user role based on email
 */
export const determineUserRole = (email: string | undefined): 'admin' | 'user' | null => {
  if (!email) return null;
  if (email === 'admin@example.com') return 'admin';
  return 'user';
};

/**
 * Type definitions for authentication operations
 */
export interface AuthError {
  message: string;
}

export interface AuthResult<T> {
  data: T | null;
  error: Error | null;
}

export interface SignUpResult {
  user: User | null;
  session: any;
}

/**
 * Check if user is authenticated for direct access mode
 * This is used for development/testing without requiring full authentication
 */
export const isDirectAccessEnabled = (): boolean => {
  return sessionStorage.getItem('direct_access') === 'true';
};
