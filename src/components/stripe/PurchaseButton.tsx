
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface PurchaseButtonProps {
  sellerId?: string;
  artworkName: string;
  price: number;
  artworkUrl?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const PurchaseButton = ({ 
  sellerId,
  artworkName, 
  price, 
  artworkUrl,
  variant = "default", 
  size = "default",
  className 
}: PurchaseButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to purchase artwork.",
        variant: "destructive",
      });
      return;
    }

    if (sellerId && user.id === sellerId) {
      toast({
        title: "Cannot purchase your own artwork",
        description: "You cannot purchase your own artwork.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          type: "purchase",
          creatorId: sellerId,
          name: artworkName,
          price,
          artworkUrl
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to get checkout URL");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase error",
        description: "Could not process your purchase request. Please try again.",
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
      onClick={handlePurchase}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>Buy ${price}</>
      )}
    </Button>
  );
};

export default PurchaseButton;
