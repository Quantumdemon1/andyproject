
import React from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface CoverPhotoProps {
  userId: string | undefined;
  coverUrl: string | null;
  onCoverPhotoChange: (url: string) => void;
}

const CoverPhoto = ({ userId, coverUrl, onCoverPhotoChange }: CoverPhotoProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  
  const handleCoverPhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !userId) return;
    
    try {
      setLoading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/cover-photo.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data: publicURL } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);
      
      // Update the cover_url in the database
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ cover_url: publicURL.publicUrl })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      // Update parent component state
      onCoverPhotoChange(publicURL.publicUrl);
      
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {loading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div 
          className="h-48 bg-gradient-to-r from-aura-darkPurple to-aura-purple"
          style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        />
      )}
      <input
        type="file"
        id="cover-upload"
        className="hidden"
        accept="image/*"
        onChange={handleCoverPhotoChange}
        disabled={loading}
      />
      <label htmlFor="cover-upload">
        <Button 
          className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm hover:bg-black/70" 
          variant="outline" 
          size="sm"
          disabled={loading}
        >
          <Camera size={16} className="mr-2" /> {loading ? 'Uploading...' : 'Change Cover'}
        </Button>
      </label>
    </div>
  );
};

export default CoverPhoto;
