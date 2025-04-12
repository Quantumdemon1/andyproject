
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Check, DollarSign, UserPlus } from "lucide-react";

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
  price = "5.00"
}) => {
  const { toast } = useToast();
  const [subscribed, setSubscribed] = useState(isSubscribed);
  
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
  
  return (
    <div className="rounded-xl overflow-hidden bg-aura-charcoal border border-white/10 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-aura-purple/20">
      {/* Header image with gradient overlay */}
      <div className="h-36 bg-gradient-to-br from-aura-purple to-aura-blue relative">
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
      
      <div className="p-4 pt-0 pb-4 relative">
        {/* Profile image */}
        <div className="absolute -top-10 left-4">
          <div 
            className="h-20 w-20 rounded-full border-4 border-aura-charcoal bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        </div>
        
        <div className="mt-12">
          <div className="flex justify-between items-start mb-1">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{name}</h3>
              </div>
              <p className="text-sm text-gray-400">@{username}</p>
            </div>
            
            <Button 
              variant={subscribed ? "secondary" : "default"}
              size="sm"
              className={`flex items-center gap-1 ${
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
                      <DollarSign size={14} /> Subscribe ${price}
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
          
          <p className="text-sm text-gray-300 line-clamp-2 mt-2">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default CreatorCard;
