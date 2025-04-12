
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check, DollarSign, UserPlus, BadgeCheck, Star, Heart, User } from "lucide-react";

interface CreatorCardProps {
  name: string;
  username: string;
  description: string;
  imageUrl: string;
  isSubscribed?: boolean;
  price?: string;
  isVerified?: boolean;
  tier?: "Basic" | "Premium" | null;
  followers?: number;
  category?: string;
  rating?: number;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ 
  name, 
  username, 
  description, 
  imageUrl, 
  isSubscribed = false,
  price = "5.00",
  isVerified = false,
  tier = null,
  followers = 0,
  category,
  rating = 0
}) => {
  const { toast } = useToast();
  const [subscribed, setSubscribed] = useState(isSubscribed);
  const [liked, setLiked] = useState(false);
  
  const handleSubscribe = () => {
    if (subscribed) {
      toast({
        title: "Already subscribed",
        description: `You're already subscribed to ${name}'s content.`,
      });
      return;
    }
    
    toast({
      title: "Subscription successful!",
      description: `You are now subscribed to ${name}'s content.`,
    });
    setSubscribed(true);
  };
  
  const handleLike = () => {
    setLiked(!liked);
    if (!liked) {
      toast({
        title: "Added to favorites",
        description: `${name} has been added to your favorites.`,
      });
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="rounded-xl overflow-hidden bg-aura-charcoal border border-white/10 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-aura-purple/20">
      {/* Header image with gradient overlay - height reduced from h-32 to h-24 */}
      <div className="h-24 bg-gradient-to-br from-aura-blue to-aura-purple relative">
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Category badge if available */}
        {category && (
          <div className="absolute top-3 left-3">
            <Badge variant="tier" className="bg-black/30 border border-white/20">
              {category}
            </Badge>
          </div>
        )}
        
        {/* Like button */}
        <button 
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/30 flex items-center justify-center border border-white/20 hover:bg-black/50 transition-colors"
          onClick={handleLike}
        >
          <Heart className={`h-4 w-4 ${liked ? 'text-pink-500 fill-pink-500' : 'text-white'}`} />
        </button>
      </div>
      
      <div className="p-5 pb-4 relative">
        {/* Profile image - moved to align better with content */}
        <div className="flex items-start mb-4">
          <Avatar className="h-14 w-14 border-2 border-aura-charcoal ring-2 ring-white/10 mr-3">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-aura-blue to-aura-purple text-white">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-base">{name}</h3>
              {isVerified && (
                <BadgeCheck className="h-4 w-4 text-aura-blue" />
              )}
            </div>
            
            <div className="flex items-center text-gray-400 text-sm">
              @{username}
              {tier && (
                <Badge variant="tier" className="text-xs ml-1.5 py-0 h-5 bg-white/10">
                  {tier}
                </Badge>
              )}
            </div>
          </div>
          
          <Button 
            variant={subscribed ? "secondary" : "default"}
            size="sm"
            className={`flex items-center gap-1 h-8 ${
              subscribed 
                ? "bg-white/10 hover:bg-white/20" 
                : "bg-gradient-to-r from-aura-blue to-aura-purple hover:from-aura-purple hover:to-aura-blue"
            }`}
            onClick={handleSubscribe}
          >
            {subscribed ? (
              <>
                <Check size={14} /> Subscribed
              </>
            ) : (
              <>
                {price ? (
                  <>
                    <DollarSign size={14} /> {price}
                  </>
                ) : (
                  <>
                    <UserPlus size={14} /> Follow
                  </>
                )}
              </>
            )}
          </Button>
        </div>
        
        <p className="text-sm text-gray-300 line-clamp-2 mb-3">{description}</p>
        
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1">
            <UserPlus className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">{followers.toLocaleString()}</span>
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-xs text-gray-400">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorCard;
