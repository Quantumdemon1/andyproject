
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SubscribeButton from "@/components/stripe/SubscribeButton";

interface Subscription {
  id: string;
  creator_id: string;
  end_date: string;
  status: string;
  creator_name?: string;
}

const SubscriptionNotice = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [expiredSubscription, setExpiredSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  
  useEffect(() => {
    const fetchExpiredSubscriptions = async () => {
      if (!user) return;
      
      try {
        // Get expired subscriptions
        const { data: subscriptions, error } = await supabase
          .from("subscriptions")
          .select(`
            id, 
            creator_id,
            end_date,
            status
          `)
          .eq("subscriber_id", user.id)
          .eq("status", "expired")
          .order("end_date", { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (subscriptions && subscriptions.length > 0) {
          const subscription = subscriptions[0];
          
          // Fetch creator's username
          const { data: creatorProfile } = await supabase
            .from("user_profiles")
            .select("username")
            .eq("id", subscription.creator_id)
            .single();
            
          setExpiredSubscription({
            ...subscription,
            creator_name: creatorProfile?.username || "Creator"
          });
        }
      } catch (error) {
        console.error("Error fetching expired subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExpiredSubscriptions();
  }, [user]);
  
  // For demo purposes, show a static notice if no real expired subscriptions exist
  const demoExpiredSubscription = {
    id: "demo-sub-1",
    creator_id: "demo-creator-1",
    end_date: "2025-02-23",
    status: "expired",
    creator_name: "Marcus Lee"
  };
  
  const subscription = expiredSubscription || demoExpiredSubscription;
  const endDate = subscription ? new Date(subscription.end_date) : new Date();
  const formattedDate = `${endDate.toLocaleString('default', { month: 'short' })} ${endDate.getDate()}`;
  
  if (loading || dismissed) return null;
  
  return (
    <div className={cn(
      "flex border border-aura-blue/30 rounded-lg mb-6 items-center bg-aura-blue/5",
      isMobile ? "p-2 text-xs" : "p-3"
    )}>
      <div className={cn(
        "text-aura-blue",
        isMobile ? "mr-2" : "mr-3"
      )}>
        <Info size={isMobile ? 16 : 20} />
      </div>
      <div className="flex-1">
        <p className={cn(
          isMobile ? "text-xs" : "text-sm"
        )}>
          Your subscription to <span className="font-semibold">{subscription.creator_name}</span> has expired on {formattedDate}
        </p>
      </div>
      <div className="flex space-x-2">
        {!isMobile && (
          <SubscribeButton 
            creatorId={subscription.creator_id} 
            price={9.99} 
            variant="outline" 
            size="sm" 
            className="h-8 px-2 text-xs bg-aura-blue text-white hover:bg-aura-blue/90 border-none" 
          />
        )}
        <Button 
          variant="link" 
          className={cn(
            "text-aura-blue font-normal",
            isMobile ? "px-2 text-xs" : "px-3"
          )}
          onClick={() => setDismissed(true)}
        >
          DISMISS
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionNotice;
