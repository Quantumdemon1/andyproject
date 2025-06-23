
import { User } from "@supabase/supabase-js";

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
 * Check if direct access is enabled (development only)
 * This will be disabled in production builds
 */
export const isDirectAccessEnabled = (): boolean => {
  // Only allow direct access in development mode
  if (import.meta.env.PROD) {
    return false;
  }
  
  // Check for direct access flag in development
  return import.meta.env.DEV && sessionStorage.getItem('directAccess') === 'true';
};

/**
 * Enable direct access (development only)
 */
export const enableDirectAccess = (): void => {
  if (import.meta.env.DEV) {
    sessionStorage.setItem('directAccess', 'true');
  }
};

/**
 * Disable direct access
 */
export const disableDirectAccess = (): void => {
  sessionStorage.removeItem('directAccess');
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
