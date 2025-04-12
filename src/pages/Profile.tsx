
import React from "react";
import MainLayout from "@/components/MainLayout";
import { User, Camera, Edit, Settings, Image, BookOpen, Users, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const Profile = () => {
  return (
    <MainLayout title="MY PROFILE" backButton={true}>
      <div className="bg-gradient-to-r from-aura-darkPurple to-aura-purple h-48 relative">
        <Button className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm hover:bg-black/70" variant="outline" size="sm">
          <Camera size={16} className="mr-2" /> Change Cover
        </Button>
      </div>
      
      <div className="px-6 relative">
        <div className="flex justify-between mt-[-40px]">
          <div className="flex">
            <div className="h-20 w-20 rounded-full bg-aura-charcoal border-4 border-aura-darkPurple flex items-center justify-center">
              <User size={40} />
            </div>
            <div className="ml-4 pt-10">
              <h1 className="text-2xl font-bold">Your Name</h1>
              <p className="text-gray-400">@username</p>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="gradient" className="btn-pulse">
              <Edit size={16} className="mr-2" /> Edit Profile
            </Button>
          </div>
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
            Digital artist and photographer sharing my creative journey. Lover of landscapes and urban photography.
          </p>
          <div className="mt-4 flex gap-2">
            <Badge variant="outline">Photographer</Badge>
            <Badge variant="outline">Digital Artist</Badge>
            <Badge variant="outline">Travel</Badge>
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
