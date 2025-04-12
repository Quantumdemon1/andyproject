
import React from "react";
import { Image, BookOpen, Users, Heart, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProfileTabs = () => {
  return (
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
  );
};

export default ProfileTabs;
