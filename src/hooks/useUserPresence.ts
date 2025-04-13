
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useCallback } from "react";

/**
 * Hook to manage user presence state in the database
 */
export const useUserPresence = (user: User | null) => {
  /**
   * Updates user presence status in the database
   */
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

  // Set up visibility change handlers
  useEffect(() => {
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

  return { updateUserPresence };
};
