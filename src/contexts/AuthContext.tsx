
import React, { createContext, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuthState } from "@/hooks/useAuthState";
import { determineUserRole, AuthResult, SignUpResult, cleanupAuthState, fetchUserRole } from "@/utils/authUtils";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  userRole: 'admin' | 'user' | null;
  signIn: (email: string, password: string) => Promise<AuthResult<Session>>;
  signUp: (email: string, password: string, username?: string) => Promise<AuthResult<SignUpResult>>;
  signOut: () => Promise<void>;
  updateUserPresence: (isOnline: boolean) => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // Use the refactored auth state hook
  const { session, user, loading, userRole, updateUserPresence, setUserRole } = useAuthState();

  // Function to refresh user role from database
  const refreshUserRole = async () => {
    if (user?.id) {
      const role = await fetchUserRole(user.id);
      if (role && setUserRole) {
        setUserRole(role);
      }
    }
  };

  // Sign in functionality
  const signIn = async (email: string, password: string): Promise<AuthResult<Session>> => {
    try {
      console.log("Signing in with:", email);
      
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Sign in error:", error);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }
      
      console.log("Sign in successful:", data.user?.email);
      
      // Fetch the actual role from database
      if (data.user?.id) {
        const dbRole = await fetchUserRole(data.user.id);
        toast({
          title: "Welcome back!",
          description: `You've successfully signed in as ${dbRole || 'user'}`,
        });
      }
      
      return { error: null, data: data.session };
    } catch (error) {
      console.error("Unexpected sign in error:", error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error: error as Error, data: null };
    }
  };

  // Sign up functionality
  const signUp = async (email: string, password: string, username?: string): Promise<AuthResult<SignUpResult>> => {
    try {
      console.log("Signing up with:", email);
      
      // Clean up existing state
      cleanupAuthState();
      
      // Add metadata for the user profile
      const metadata = username ? { username } : {}; 
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: window.location.origin + '/home'
        }
      });
      
      if (error) {
        console.error("Sign up error:", error);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: { user: null, session: null } };
      }
      
      console.log("Sign up successful:", data.user?.email);
      
      // Check if email confirmation is required
      if (data.session === null) {
        toast({
          title: "Verification email sent",
          description: "Please check your email to confirm your account.",
        });
      } else {
        toast({
          title: "Welcome!",
          description: `Your account has been created successfully as ${determineUserRole(data.user?.email)}`,
        });
      }
      
      return { error: null, data };
    } catch (error) {
      console.error("Unexpected sign up error:", error);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { 
        error: error as Error, 
        data: { user: null, session: null } 
      };
    }
  };

  // Sign out functionality
  const signOut = async () => {
    if (user) {
      await updateUserPresence(false);
    }
    
    // Clean up auth state
    cleanupAuthState();
    
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Ignore errors
    }
    
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
    
    // Force page reload for clean state
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        userRole,
        signIn,
        signUp,
        signOut,
        updateUserPresence,
        refreshUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
