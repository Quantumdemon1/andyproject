import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check, DollarSign, UserPlus, BadgeCheck, Star, Heart, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
  const isMobile = useIsMobile();
  
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
      <div className={cn(
        "relative bg-gradient-to-br from-aura-blue to-aura-purple",
        isMobile ? "h-20" : "h-24"
      )}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {category && (
          <div className="absolute top-3 left-3">
            <Badge variant="tier" className="bg-black/30 border border-white/20">
              {category}
            </Badge>
          </div>
        )}
        
        <button 
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/30 flex items-center justify-center border border-white/20 hover:bg-black/50 transition-colors"
          onClick={handleLike}
        >
          <Heart className={`h-4 w-4 ${liked ? 'text-pink-500 fill-pink-500' : 'text-white'}`} />
        </button>

        <Avatar className={cn(
          "absolute -bottom-6 left-5 border-2 border-aura-charcoal ring-2 ring-white/10",
          isMobile ? "h-12 w-12" : "h-16 w-16"
        )}>
          <AvatarImage src={imageUrl} alt={name} />
          <AvatarFallback className="bg-gradient-to-br from-aura-blue to-aura-purple text-white">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        
        <div className={cn(
          "absolute -bottom-6 right-5",
          isMobile ? "scale-90 origin-right" : ""
        )}>
          <Button 
            variant={subscribed ? "secondary" : "default"}
            size={isMobile ? "sm" : "default"}
            className={`flex items-center gap-1 ${
              subscribed 
                ? "bg-white/10 hover:bg-white/20" 
                : "bg-gradient-to-r from-aura-blue to-aura-purple hover:from-aura-purple hover:to-aura-blue"
            } ${isMobile ? "h-8 text-xs" : ""}`}
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
      </div>
      
      <div className={cn(
        "relative",
        isMobile ? "p-3 pt-7" : "p-4 pt-8"
      )}>
        <div className="mb-2">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className={cn(
              "font-semibold truncate",
              isMobile ? "text-sm max-w-[160px]" : "text-base max-w-[200px]"
            )}>{name}</h3>
            {isVerified && (
              <BadgeCheck className="h-4 w-4 text-aura-blue flex-shrink-0" />
            )}
          </div>
          
          <div className="text-gray-400 text-sm flex items-center gap-1.5">
            <span className={cn(
              "truncate",
              isMobile ? "max-w-[100px] text-xs" : "max-w-[120px]"
            )}>@{username}</span>
            {tier && (
              <Badge variant="tier" className="text-xs py-0 h-5 bg-white/10">
                {tier}
              </Badge>
            )}
          </div>
        </div>
        
        <p className={cn(
          "text-gray-300 line-clamp-2 mb-3 mt-2",
          isMobile ? "text-xs" : "text-sm"
        )}>{description}</p>
        
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <User className={cn(
              "text-gray-400",
              isMobile ? "h-3 w-3" : "h-3.5 w-3.5"
            )} />
            <span className={cn(
              "text-gray-400",
              isMobile ? "text-[10px]" : "text-xs"
            )}>{followers.toLocaleString()} followers</span>
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-1.5">
              <Star className={cn(
                "text-yellow-500 fill-yellow-500",
                isMobile ? "h-3 w-3" : "h-3.5 w-3.5"
              )} />
              <span className={cn(
                "text-gray-400",
                isMobile ? "text-[10px]" : "text-xs"
              )}>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorCard;
