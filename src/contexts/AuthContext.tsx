
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
  signUp: (email: string, password: string) => Promise<{
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
      (_event, session) => {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      return { error: null, data: data.session };
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error: error as Error, data: null };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: { user: null, session: null } };
      }
      
      toast({
        title: "Welcome!",
        description: "Your account has been created.",
      });
      
      return { error: null, data };
    } catch (error) {
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
