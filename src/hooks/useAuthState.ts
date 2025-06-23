
import { useState, useEffect, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { determineUserRole } from "@/utils/authUtils";

/**
 * Hook to manage authentication state
 */
export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);

  // User presence update function
  const updateUserPresence = useCallback(async (isOnline: boolean) => {
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
  }, [user]);

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setUserRole(determineUserRole(session?.user?.email));
        
        // Update user presence when auth state changes
        if (session?.user) {
          setTimeout(() => {
            updateUserPresence(true);
          }, 0);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setUserRole(determineUserRole(session?.user?.email));
      
      if (session?.user) {
        updateUserPresence(true);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [updateUserPresence]);

  // Set up visibility change handlers
  useEffect(() => {
    if (!user) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user) {
        updateUserPresence(true);
      } else if (document.visibilityState === "hidden" && user) {
        updateUserPresence(false);
      }
    };

    // Add listener for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (user) {
        updateUserPresence(false);
      }
    };
  }, [user, updateUserPresence]);

  return {
    session,
    user,
    loading,
    userRole,
    updateUserPresence,
  };
};
