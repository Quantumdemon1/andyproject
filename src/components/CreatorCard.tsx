
import React from "react";
import { Button } from "@/components/ui/button";

interface CreatorCardProps {
  name: string;
  username: string;
  description: string;
  imageUrl: string;
  isSubscribed?: boolean;
  price?: string;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ 
  name, 
  username, 
  description, 
  imageUrl, 
  isSubscribed = false,
  price = "$5.00"
}) => {
  return (
    <div className="rounded-xl overflow-hidden bg-aura-charcoal border border-white/10 transition-transform hover:-translate-y-1">
      <div className="h-36 bg-gradient-to-r from-aura-purple/30 to-aura-blue/30" />
      
      <div className="px-4 pt-0 pb-4 relative">
        <div className="absolute -top-10 left-4">
          <div className="h-20 w-20 rounded-full border-4 border-aura-charcoal" style={{ 
            backgroundImage: `url(${imageUrl})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}/>
        </div>
        
        <div className="mt-12">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <p className="text-sm text-gray-400">@{username}</p>
            </div>
            
            <Button 
              variant={isSubscribed ? "secondary" : "default"}
              size="sm"
              className={isSubscribed ? "bg-white/10 hover:bg-white/20" : "bg-aura-blue hover:bg-aura-blue/80"}
            >
              {isSubscribed ? "Subscribed" : `Subscribe $${price}`}
            </Button>
          </div>
          
          <p className="text-sm text-gray-300 mt-3 line-clamp-2">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default CreatorCard;
