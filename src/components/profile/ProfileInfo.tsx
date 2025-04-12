
import React from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/pages/Profile";

interface ProfileInfoProps {
  profile: UserProfile | null;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProfileInfo = ({ profile, setEditMode }: ProfileInfoProps) => {
  return (
    <>
      <div className="flex justify-between mt-[-40px]">
        <div className="flex">
          <div className="ml-4 pt-10">
            <h1 className="text-2xl font-bold">{profile?.display_name || "Your Name"}</h1>
            <p className="text-gray-400">@{profile?.username || "username"}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <Button variant="gradient" className="btn-pulse" onClick={() => setEditMode(true)}>
          <Edit size={16} className="mr-2" /> Edit Profile
        </Button>
      </div>
      
      <div className="mt-6 flex gap-6 text-center">
        <div>
          <p className="font-bold text-xl">248</p>
          <p className="text-gray-400 text-sm">Posts</p>
        </div>
        <div>
          <p className="font-bold text-xl">15.3K</p>
          <p className="text-gray-400 text-sm">Followers</p>
        </div>
        <div>
          <p className="font-bold text-xl">652</p>
          <p className="text-gray-400 text-sm">Following</p>
        </div>
      </div>
      
      <div className="mt-6">
        <p className="text-gray-300">
          {profile?.bio || "Digital artist and photographer sharing my creative journey. Lover of landscapes and urban photography."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {profile?.tags ? 
            profile.tags.split(',').map((tag, i) => (
              <Badge key={i} variant="outline">{tag}</Badge>
            )) :
            <>
              <Badge variant="outline">Photographer</Badge>
              <Badge variant="outline">Digital Artist</Badge>
              <Badge variant="outline">Travel</Badge>
            </>
          }
        </div>
      </div>
    </>
  );
};

export default ProfileInfo;
