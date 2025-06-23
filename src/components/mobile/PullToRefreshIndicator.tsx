
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  progress: number;
  isRefreshing: boolean;
  isPulling: boolean;
}

const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  progress,
  isRefreshing,
  isPulling
}) => {
  if (!isPulling && !isRefreshing) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-4">
      <div className={cn(
        "bg-background/80 backdrop-blur-sm rounded-full p-2 border transition-all duration-200",
        progress >= 1 ? "scale-110" : "scale-100"
      )}>
        <RefreshCw 
          className={cn(
            "h-5 w-5 text-primary transition-transform duration-200",
            isRefreshing ? "animate-spin" : "",
            progress >= 1 ? "rotate-180" : `rotate-${Math.floor(progress * 180)}`
          )}
          style={{
            transform: !isRefreshing ? `rotate(${progress * 180}deg)` : undefined
          }}
        />
      </div>
    </div>
  );
};

export default PullToRefreshIndicator;
