
import React from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/pages/Profile";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileHeaderProps {
  profile: UserProfile | null;
  user: any;
}

const ProfileHeader = ({ profile, user }: ProfileHeaderProps) => {
  const { toast } = useToast();
  
  const handleCoverPhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return;
    
    try {
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/cover-photo.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      toast({
        title: "Success",
        description: "Cover photo updated successfully",
      });
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      toast({
        title: "Error",
        description: "Failed to update cover photo",
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
      <div className="bg-gradient-to-r from-aura-darkPurple to-aura-purple h-48 relative">
        <input
          type="file"
          id="cover-upload"
          className="hidden"
          accept="image/*"
          onChange={handleCoverPhotoChange}
        />
        <label htmlFor="cover-upload">
          <Button className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm hover:bg-black/70" variant="outline" size="sm">
            <Camera size={16} className="mr-2" /> Change Cover
          </Button>
        </label>
      </div>
    </>
  );
};

export default ProfileHeader;
