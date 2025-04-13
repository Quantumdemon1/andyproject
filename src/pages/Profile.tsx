
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ProfileEditForm } from "@/components/profile/edit/ProfileEditForm";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ProfileLoading from "@/components/profile/ProfileLoading";

export interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  cover_url?: string | null;
  display_name?: string | null;
  bio?: string | null;
  tags?: string | null;
  is_online?: boolean | null;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  
  // Create a fallback profile for direct access mode
  const fallbackProfile: UserProfile = {
    id: 'demo-user',
    username: 'demo_user',
    avatar_url: null,
    display_name: 'Demo User',
    bio: 'This is a demo profile since you are in direct access mode.',
    tags: 'demo,preview,testing',
    is_online: true
  };
  
  useEffect(() => {
    async function fetchProfile() {
      try {
        // Check if in direct access mode (no authentication)
        const hasDirectAccess = sessionStorage.getItem('direct_access') === 'true';
        
        if (!user && !hasDirectAccess) {
          // If not in direct access and no user, we still want to show something
          setTimeout(() => {
            setProfile(fallbackProfile);
            setLoading(false);
          }, 500); // Small timeout to avoid flickering
          return;
        }
        
        if (!user && hasDirectAccess) {
          // In direct access mode with no user, use fallback profile
          setProfile(fallbackProfile);
          setLoading(false);
          return;
        }
        
        if (user) {
          // If we have a real user, fetch their profile
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching profile:', error);
            // If there's an error fetching the profile, still show something
            setProfile(fallbackProfile);
          } else {
            setProfile(data);
          }
        }
      } catch (error) {
        console.error('Error in profile fetch:', error);
        toast({
          title: "Error",
          description: "Failed to load profile information",
          variant: "destructive",
        });
        // On error, use fallback profile
        setProfile(fallbackProfile);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [user, toast]);

  if (loading) {
    return <ProfileLoading />;
  }

  if (editMode && profile) {
    return (
      <MainLayout title="EDIT PROFILE" backButton={true}>
        <div className="p-6">
          <ProfileEditForm
            defaultValues={{
              username: profile.username || "",
              displayName: profile.display_name || "",
              bio: profile.bio || "",
              tags: profile.tags || "",
            }}
            onSuccess={() => setEditMode(false)}
            onCancel={() => setEditMode(false)}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="MY PROFILE" backButton={true}>
      <ProfileHeader profile={profile} user={user} />
      
      <div className="px-6 relative">
        <div className="flex justify-between mt-[-40px]">
          <ProfileAvatar profile={profile} user={user} setProfile={setProfile} />
        </div>
        
        <ProfileInfo profile={profile} setEditMode={setEditMode} />
        
        <ProfileTabs />
      </div>
    </MainLayout>
  );
};

export default Profile;
