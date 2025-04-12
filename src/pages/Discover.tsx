
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { Search, Filter, Users, Flame, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Creator {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  tags: string;
  follower_count: number;
  is_verified?: boolean;
  is_trending?: boolean;
  is_featured?: boolean;
}

const CreatorCard = ({ creator }: { creator: Creator }) => {
  return (
    <Card className="bg-aura-charcoal border-white/10 overflow-hidden hover:border-aura-purple/50 transition-all duration-300">
      <div className="h-32 bg-gradient-to-r from-aura-blue/30 to-aura-purple/30"></div>
      <div className="p-4 relative">
        <div className="h-16 w-16 rounded-full bg-aura-charcoal absolute -top-8 border-4 border-aura-charcoal overflow-hidden">
          {creator.avatar_url ? (
            <img src={creator.avatar_url} alt={creator.display_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-aura-purple/20">
              <Users size={24} />
            </div>
          )}
        </div>
        
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{creator.display_name}</h3>
              <p className="text-sm text-gray-400">@{creator.username}</p>
            </div>
            {creator.is_verified && (
              <div className="bg-aura-blue rounded-full p-1">
                <Star size={14} fill="white" />
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-300 mt-2 line-clamp-2">{creator.bio}</p>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-wrap gap-1 max-w-[70%]">
              {creator.tags?.split(',').slice(0, 2).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
              ))}
              {creator.tags?.split(',').length > 2 && (
                <Badge variant="outline" className="text-xs">+{creator.tags.split(',').length - 2}</Badge>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {creator.follower_count.toLocaleString()} followers
            </div>
          </div>
          
          <Button variant="subscribe" className="w-full mt-4 text-sm">
            Follow
          </Button>
          
          {creator.is_trending && (
            <div className="absolute top-2 right-2 bg-aura-charcoal/80 rounded-full p-1.5 backdrop-blur-sm">
              <TrendingUp size={14} className="text-aura-blue" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would fetch from Supabase
    const mockCreators: Creator[] = [
      {
        id: "1",
        username: "artmaster",
        display_name: "Art Master",
        avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        bio: "Digital artist specializing in surreal landscapes and futuristic designs.",
        tags: "Digital Art,Surrealism,Landscapes",
        follower_count: 15300,
        is_verified: true,
        is_trending: true
      },
      {
        id: "2",
        username: "photoexplorers",
        display_name: "Photo Explorers",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        bio: "Capturing moments around the world. Travel photographer sharing unique perspectives.",
        tags: "Photography,Travel,Nature",
        follower_count: 8750,
        is_verified: true
      },
      {
        id: "3",
        username: "sketch_daily",
        display_name: "Sketch Daily",
        avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        bio: "One sketch a day keeps the creative block away. Traditional artist sharing daily creations.",
        tags: "Sketching,Traditional,Daily Art",
        follower_count: 5280
      },
      {
        id: "4",
        username: "colortheory",
        display_name: "Color Theory",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        bio: "Exploring color combinations and their psychological effects through digital art.",
        tags: "Color Theory,Digital Art,Psychology",
        follower_count: 12400,
        is_featured: true
      },
      {
        id: "5",
        username: "urbanvibes",
        display_name: "Urban Vibes",
        avatar_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
        bio: "Street photography and urban landscapes. Capturing city life in all its glory.",
        tags: "Street Photography,Urban,City Life",
        follower_count: 9300,
        is_trending: true
      },
      {
        id: "6",
        username: "abstractminds",
        display_name: "Abstract Minds",
        avatar_url: "",
        bio: "Creating abstract art that challenges perception and invites interpretation.",
        tags: "Abstract,Experimental,Modern Art",
        follower_count: 7500
      }
    ];
    
    setTimeout(() => {
      setCreators(mockCreators);
      setLoading(false);
    }, 800);
  }, []);
  
  const filteredCreators = creators.filter(creator => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      creator.username.toLowerCase().includes(query) ||
      creator.display_name.toLowerCase().includes(query) ||
      creator.bio.toLowerCase().includes(query) ||
      creator.tags.toLowerCase().includes(query)
    );
  });
  
  return (
    <MainLayout title="DISCOVER CREATORS" backButton>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter size={18} />
          </Button>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="trending">
              <Flame size={14} className="mr-1" /> Trending
            </TabsTrigger>
            <TabsTrigger value="featured">
              <Star size={14} className="mr-1" /> Featured
            </TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="bg-aura-charcoal border-white/10 h-64 animate-pulse" />
                ))}
              </div>
            ) : filteredCreators.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCreators.map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Users size={40} className="mx-auto text-gray-500 mb-2" />
                <h3 className="text-lg font-medium">No creators found</h3>
                <p className="text-gray-400">Try adjusting your search terms</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="trending">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCreators
                .filter(creator => creator.is_trending)
                .map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="featured">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCreators
                .filter(creator => creator.is_featured || creator.is_verified)
                .map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="new">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCreators
                .slice(0, 2) // Just showing the newest 2 for demo
                .map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Discover;
