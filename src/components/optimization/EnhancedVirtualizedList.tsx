
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-states';

interface EnhancedVirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

function EnhancedVirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onLoadMore,
  hasNextPage = false,
  isLoading = false,
  loadingComponent,
  emptyComponent
}: EnhancedVirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadingMore = useRef(false);

  const { startIndex, endIndex, visibleItems, totalHeight, offsetY } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
      startIndex: start,
      endIndex: end,
      visibleItems: items.slice(start, end + 1),
      totalHeight: items.length * itemHeight,
      offsetY: start * itemHeight
    };
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);

    // Infinite scroll logic
    if (onLoadMore && hasNextPage && !isLoading && !isLoadingMore.current) {
      const scrollHeight = event.currentTarget.scrollHeight;
      const clientHeight = event.currentTarget.clientHeight;
      const scrollPosition = newScrollTop + clientHeight;
      
      // Load more when 80% scrolled
      if (scrollPosition >= scrollHeight * 0.8) {
        isLoadingMore.current = true;
        onLoadMore();
      }
    }
  }, [onLoadMore, hasNextPage, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      isLoadingMore.current = false;
    }
  }, [isLoading]);

  // Performance optimization: memoize rendered items
  const renderedItems = useMemo(() => {
    return visibleItems.map((item, index) => (
      <div key={startIndex + index} style={{ height: itemHeight }}>
        {renderItem(item, startIndex + index)}
      </div>
    ));
  }, [visibleItems, startIndex, itemHeight, renderItem]);

  if (items.length === 0 && !isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        {emptyComponent || (
          <div className="text-center text-gray-400">
            <p>No items to display</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {renderedItems}
        </div>
        
        {/* Loading indicator for infinite scroll */}
        {isLoading && hasNextPage && (
          <div className="flex justify-center py-4">
            {loadingComponent || (
              <LoadingSpinner size="sm" className="text-aura-purple" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedVirtualizedList;
