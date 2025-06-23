
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
  const [error, setError] = useState<string | null>(null);
  
  const fetchProfile = async () => {
    if (!user) {
      setError("Please log in to view your profile");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        throw error;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError("Failed to load profile information");
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleProfileUpdate = (updatedData: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updatedData });
    }
  };

  const handleEditSuccess = () => {
    setEditMode(false);
    // Refetch profile data to ensure we have the latest information
    fetchProfile();
  };

  if (loading) {
    return <ProfileLoading />;
  }

  if (error || !profile) {
    return (
      <MainLayout title="PROFILE" backButton={true}>
        <div className="p-6 text-center">
          <p className="text-gray-400 mb-4">{error || "Profile not found"}</p>
          <button 
            onClick={fetchProfile}
            className="text-blue-500 hover:text-blue-400"
          >
            Try Again
          </button>
        </div>
      </MainLayout>
    );
  }

  if (editMode) {
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
            onSuccess={handleEditSuccess}
            onCancel={() => setEditMode(false)}
            onProfileUpdate={handleProfileUpdate}
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
