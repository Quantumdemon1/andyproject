
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface SubscribeButtonProps {
  creatorId: string;
  price: number;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const SubscribeButton = ({ 
  creatorId, 
  price, 
  variant = "default", 
  size = "default",
  className 
}: SubscribeButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to subscribe to this creator.",
        variant: "destructive",
      });
      return;
    }

    if (user.id === creatorId) {
      toast({
        title: "Cannot subscribe to yourself",
        description: "You cannot subscribe to your own content.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          type: "subscription",
          creatorId,
          price
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to get checkout URL");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription error",
        description: "Could not process your subscription request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSubscribe}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>Subscribe ${price}/month</>
      )}
    </Button>
  );
};

export default SubscribeButton;
