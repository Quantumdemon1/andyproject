
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const SubscriptionNotice = () => {
  const isMobile = useIsMobile();
  
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
        )}>Your subscription to <span className="font-semibold">Marcus Lee</span> has expired on Feb 23</p>
      </div>
      <Button variant="link" className={cn(
        "text-aura-blue font-normal",
        isMobile ? "px-2 text-xs" : "px-3"
      )}>
        DISMISS
      </Button>
    </div>
  );
};

export default SubscriptionNotice;
