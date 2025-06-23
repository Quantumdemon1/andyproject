
import { useCallback, useRef, useState, useEffect } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  disabled?: boolean;
}

export const usePullToRefresh = ({ 
  onRefresh, 
  threshold = 100,
  disabled = false 
}: PullToRefreshOptions) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const containerRef = useRef<HTMLElement | null>(null);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || window.scrollY > 0) return;
    
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = startYRef.current;
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || window.scrollY > 0 || !startYRef.current) return;

    currentYRef.current = e.touches[0].clientY;
    const deltaY = currentYRef.current - startYRef.current;

    if (deltaY > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(deltaY, threshold * 1.5));
      
      // Add some resistance to the pull
      const resistance = Math.pow(deltaY / threshold, 0.7);
      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(${resistance * 20}px)`;
      }
    }
  }, [disabled, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;

    setIsPulling(false);
    
    if (containerRef.current) {
      containerRef.current.style.transform = '';
    }

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    startYRef.current = 0;
    currentYRef.current = 0;
  }, [isPulling, disabled, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    isPulling,
    isRefreshing,
    pullDistance,
    progress: Math.min(pullDistance / threshold, 1)
  };
};
