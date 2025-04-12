
import React, { createContext, useState, useEffect, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string, username?: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null };
  }>;
  signOut: () => Promise<void>;
  updateUserPresence: (isOnline: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Update user presence when auth state changes
        if (session?.user) {
          // Use setTimeout to avoid recursive calls
          setTimeout(() => {
            updateUserPresence(true);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        updateUserPresence(true);
      }
      
      setLoading(false);
    });

    // Update presence when window focus changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user) {
        updateUserPresence(true);
      } else if (document.visibilityState === "hidden" && user) {
        updateUserPresence(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (user) {
        updateUserPresence(false);
      }
    };
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in with:", email);
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
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
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

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      console.log("Signing up with:", email);
      
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
          description: "Your account has been created successfully.",
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

  const signOut = async () => {
    if (user) {
      await updateUserPresence(false);
    }
    
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
  };

  const updateUserPresence = async (isOnline: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ 
          is_online: isOnline,
          last_seen: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating user presence:", error);
      }
    } catch (error) {
      console.error("Error updating user presence:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateUserPresence,
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
