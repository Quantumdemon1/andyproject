
import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { determineUserRole, isDirectAccessEnabled } from "@/utils/authUtils";
import { useUserPresence } from "./useUserPresence";

/**
 * Hook to manage authentication state
 */
export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);

  // Import user presence functionality
  const { updateUserPresence } = useUserPresence(user);

  useEffect(() => {
    console.log("Auth state changed:", session?.user?.email);
    
    // Check for direct access mode first
    if (isDirectAccessEnabled()) {
      console.log("Direct access mode detected, setting user as regular user");
      // Create a mock user for direct access mode
      const mockUser = {
        id: 'direct-access-user',
        email: 'user@example.com',
        role: 'user'
      } as unknown as User;
      
      setUser(mockUser);
      setUserRole('user');
      setLoading(false);
      return;
    }
    
    // Set up auth state listener for normal auth flow
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setUserRole(determineUserRole(session?.user?.email));
        
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

  return {
    session,
    user,
    loading,
    userRole,
  };
};
