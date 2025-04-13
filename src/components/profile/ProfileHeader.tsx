
import React from "react";
import { UserProfile } from "@/pages/Profile";
import CoverPhoto from "./CoverPhoto";

interface ProfileHeaderProps {
  profile: UserProfile | null;
  user: any;
}

const ProfileHeader = ({ profile, user }: ProfileHeaderProps) => {
  const [coverUrl, setCoverUrl] = React.useState<string | null>(profile?.cover_url || null);
  
  const handleCoverPhotoChange = (url: string) => {
    setCoverUrl(url);
  };
  
  return (
    <CoverPhoto 
      userId={user?.id || profile?.id || 'demo-user'} 
      coverUrl={coverUrl} 
      onCoverPhotoChange={handleCoverPhotoChange}
    />
  );
};

export default ProfileHeader;
