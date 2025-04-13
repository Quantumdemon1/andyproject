
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CreatorCard from "@/components/CreatorCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface Creator {
  id: string;
  name: string;
  username: string;
  description: string;
  imageUrl: string;
  price: string;
  isVerified: boolean;
  tier: "Premium" | "Basic";
  followers: number;
  category: string;
  rating: number;
  isSubscribed?: boolean;
}

const CreatorsListing = () => {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const isMobile = useIsMobile();

  const creators: Creator[] = [{
    id: "1",
    name: "Emma Johnson",
    username: "emmaphotography",
    description: "Nature photographer capturing landscapes and wildlife in their natural habitats.",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces&q=80",
    price: "5.99",
    isVerified: true,
    tier: "Premium",
    followers: 12500,
    category: "Photography",
    rating: 4.8
  }, {
    id: "2",
    name: "Marcus Lee",
    username: "marcusarts",
    description: "Contemporary artist specializing in abstract paintings and digital illustrations.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces&q=80",
    isSubscribed: true,
    price: "7.99",
    isVerified: false,
    tier: "Basic",
    followers: 8900,
    category: "Art",
    rating: 4.5
  }, {
    id: "3",
    name: "Sophia Rivera",
    username: "sophiadesigns",
    description: "Graphic designer and illustrator creating minimalist designs and custom logos.",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces&q=80",
    price: "4.99",
    isVerified: true,
    tier: "Premium",
    followers: 15200,
    category: "Design",
    rating: 4.9
  }, {
    id: "4",
    name: "David Wilson",
    username: "davestudios",
    description: "Fashion photographer working with top models and clothing brands globally.",
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=faces&q=80",
    price: "9.99",
    isVerified: true,
    tier: "Premium",
    followers: 23600,
    category: "Photography",
    rating: 4.7
  }, {
    id: "5",
    name: "Olivia Chen",
    username: "oliviascreations",
    description: "Watercolor artist creating delicate landscapes and botanical illustrations.",
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=faces&q=80",
    price: "6.99",
    isVerified: false,
    tier: "Basic",
    followers: 7400,
    category: "Art",
    rating: 4.4
  }, {
    id: "6",
    name: "James Peterson",
    username: "jamesvisuals",
    description: "Filmmaker and photographer specializing in cinematic storytelling.",
    imageUrl: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=400&fit=crop&crop=faces&q=80",
    price: "8.99",
    isVerified: false,
    tier: "Basic",
    followers: 10300,
    category: "Video",
    rating: 4.6
  }];

  const categories = Array.from(new Set(creators.map(creator => creator.category)));

  const filteredCreators = creators.filter(creator => {
    const tabFilter = activeTab === "purchased" ? creator.isSubscribed : true;
    const catFilter = categoryFilter ? creator.category === categoryFilter : true;
    return tabFilter && catFilter;
  });

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className={cn(
          "font-bold",
          isMobile ? "text-xl" : "text-2xl"
        )}>Discover Creators</h2>
        <Button variant="outline" size="sm" className="border-aura-blue/50 text-aura-blue hover:bg-aura-blue/10">
          View All
        </Button>
      </div>
      
      <div className={cn(
        "flex flex-wrap gap-2 mb-6",
        isMobile ? "overflow-x-auto whitespace-nowrap pb-2" : ""
      )}>
        <Badge variant={categoryFilter === null ? "default" : "outline"} className={`cursor-pointer ${categoryFilter === null ? '' : 'hover:bg-white/5'}`} onClick={() => setCategoryFilter(null)}>
          All Categories
        </Badge>
        
        {categories.map(category => (
          <Badge key={category} variant={categoryFilter === category ? "default" : "outline"} className={`cursor-pointer ${categoryFilter === category ? '' : 'hover:bg-white/5'}`} onClick={() => setCategoryFilter(category)}>
            {category}
          </Badge>
        ))}
      </div>
      
      <div className={cn(
        "grid gap-6",
        isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}>
        {filteredCreators.map(creator => (
          <CreatorCard 
            key={creator.id} 
            name={creator.name} 
            username={creator.username} 
            description={creator.description} 
            imageUrl={creator.imageUrl} 
            isSubscribed={creator.isSubscribed} 
            price={creator.price} 
            isVerified={creator.isVerified} 
            tier={creator.tier} 
            followers={creator.followers} 
            category={creator.category} 
            rating={creator.rating} 
          />
        ))}
      </div>
      
      {filteredCreators.length === 0 && (
        <div className="text-center p-8 bg-white/5 rounded-lg border border-white/10">
          <p className="text-gray-400">No creators found matching your filters.</p>
        </div>
      )}
    </>
  );
};

export default CreatorsListing;
