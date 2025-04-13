
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
