
import React from "react";
import { User, Camera } from "lucide-react";
import { UserProfile } from "@/pages/Profile";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileAvatarProps {
  profile: UserProfile | null;
  user: any;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const ProfileAvatar = ({ profile, user, setProfile }: ProfileAvatarProps) => {
  const { toast } = useToast();
  
  const handleProfilePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return;
    
    try {
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data: publicURL } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);
        
      // Update the avatar_url in the database
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicURL.publicUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: publicURL.publicUrl } : null);
      
      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast({
        title: "Error",
        description: "Failed to update profile photo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-20 w-20 rounded-full bg-aura-charcoal border-4 border-aura-darkPurple flex items-center justify-center relative group">
      {profile?.avatar_url ? (
        <img 
          src={profile.avatar_url} 
          alt={profile.display_name || "User"} 
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <User size={40} />
      )}
      <input
        type="file"
        id="avatar-upload"
        className="hidden"
        accept="image/*"
        onChange={handleProfilePhotoChange}
      />
      <label 
        htmlFor="avatar-upload"
        className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
      >
        <Camera size={20} className="text-white" />
      </label>
    </div>
  );
};

export default ProfileAvatar;
