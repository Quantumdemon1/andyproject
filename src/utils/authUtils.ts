
import { User } from "@supabase/supabase-js";

// Add missing types for AuthContext
export interface AuthResult<T> {
  data: T | null;
  error: Error | null;
}

export interface SignUpResult {
  user: User | null;
  session: any | null;
}

/**
 * Check if direct access mode is enabled (for development/testing)
 */
export const isDirectAccessEnabled = (): boolean => {
  // Check if direct access is enabled via sessionStorage or localStorage
  return (
    sessionStorage?.getItem('direct_access') === 'true' ||
    localStorage?.getItem('direct_access') === 'true'
  );
};

/**
 * Determines user role based on email address
 */
export const determineUserRole = (email?: string): 'admin' | 'user' | null => {
  if (!email) return null;
  
  // Check if user is admin based on email
  const adminEmails = ['admin@example.com']; // Update with actual admin emails
  return adminEmails.includes(email) ? 'admin' : 'user';
};

/**
 * Check if user has required role
 */
export const hasRequiredRole = (user: User | null, requiredRole?: 'admin' | 'user'): boolean => {
  if (!requiredRole) return true;
  if (!user) return false;
  
  const userRole = determineUserRole(user.email);
  
  if (requiredRole === 'admin') {
    return userRole === 'admin';
  }
  
  return userRole === 'admin' || userRole === 'user';
};

/**
 * Clean up authentication state
 */
export const cleanupAuthState = (): void => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage as well
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-') || key === 'direct_access') {
      sessionStorage.removeItem(key);
    }
  });
};
