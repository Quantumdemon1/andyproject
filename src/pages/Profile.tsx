
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { User, Camera, Edit, Settings, Image, BookOpen, Users, Heart, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ProfileEditForm } from "@/components/ProfileEditForm";

interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
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
  
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [user, toast]);
  
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
      
      // Here you would save the file path to the user's profile
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
  
  if (loading) {
    return (
      <MainLayout title="MY PROFILE" backButton={true}>
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-aura-purple" />
        </div>
      </MainLayout>
    );
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
      
      <div className="px-6 relative">
        <div className="flex justify-between mt-[-40px]">
          <div className="flex">
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
        
        <Tabs defaultValue="content" className="mt-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="content">
              <Image size={16} className="mr-2" /> Content
            </TabsTrigger>
            <TabsTrigger value="collections">
              <BookOpen size={16} className="mr-2" /> Collections
            </TabsTrigger>
            <TabsTrigger value="followers">
              <Users size={16} className="mr-2" /> Followers
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart size={16} className="mr-2" /> Favorites
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="min-h-[300px]">
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-aura-charcoal aspect-square rounded-md flex items-center justify-center">
                  <Star size={24} className="text-gray-500" />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="collections" className="min-h-[300px]">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-aura-charcoal rounded-md p-4">
                  <h3 className="font-medium mb-2">Collection {i + 1}</h3>
                  <p className="text-sm text-gray-400">5 items</p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="followers" className="min-h-[300px]">
            <p className="text-gray-400 text-center py-10">
              Connect with your followers and see who's following your content.
            </p>
          </TabsContent>
          
          <TabsContent value="favorites" className="min-h-[300px]">
            <p className="text-gray-400 text-center py-10">
              Items you've favorited will appear here.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
