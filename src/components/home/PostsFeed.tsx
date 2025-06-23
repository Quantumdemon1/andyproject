
import React, { useState, useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPosts } from '@/api/postsApi';
import Post from '@/components/Post';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

interface PostsFeedProps {
  filter?: string;
}

const PostsFeed: React.FC<PostsFeedProps> = ({ filter = 'all' }) => {
  const [retryCount, setRetryCount] = useState(0);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery({
    queryKey: ['posts', filter],
    queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam, 10, filter),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.currentPage + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { loadMoreRef } = useInfiniteScroll({
    hasMore: hasNextPage || false,
    isLoading: isFetchingNextPage,
    onLoadMore: handleLoadMore,
    threshold: 200
  });

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  // Reset retry count when filter changes
  React.useEffect(() => {
    setRetryCount(0);
  }, [filter]);

  // Flatten all posts from all pages
  const allPosts = useMemo(() => {
    return data?.pages.flatMap(page => page.posts) || [];
  }, [data]);

  if (isLoading) {
    return (
      <PerformanceMonitor componentName="PostsFeedLoading">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-aura-charcoal rounded-lg border border-white/10 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 bg-white/10" />
                  <Skeleton className="h-3 w-20 bg-white/10" />
                </div>
              </div>
              <Skeleton className="h-20 w-full mb-4 bg-white/10" />
              <div className="flex space-x-4">
                <Skeleton className="h-8 w-16 bg-white/10" />
                <Skeleton className="h-8 w-16 bg-white/10" />
                <Skeleton className="h-8 w-16 bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </PerformanceMonitor>
    );
  }

  if (isError) {
    return (
      <ErrorBoundary>
        <div className="text-center py-8 space-y-4">
          <p className="text-gray-400">Failed to load posts.</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              {error instanceof Error ? error.message : 'Please try again later.'}
            </p>
            {retryCount < 3 && (
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry ({retryCount + 1}/3)</span>
              </Button>
            )}
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (allPosts.length === 0) {
    const emptyMessages = {
      all: "No posts found. Be the first to create a post!",
      following: "No posts from users you follow. Try following some users!",
      media: "No media posts found. Share some photos or videos!",
      recent: "No recent posts found. Check back later!"
    };

    return (
      <PerformanceMonitor componentName="PostsFeedEmpty">
        <div className="text-center py-8">
          <p className="text-gray-400">{emptyMessages[filter as keyof typeof emptyMessages] || emptyMessages.all}</p>
          <Button
            onClick={() => refetch()}
            variant="ghost"
            size="sm"
            className="mt-2 text-aura-blue hover:text-aura-blue/80"
          >
            Refresh
          </Button>
        </div>
      </PerformanceMonitor>
    );
  }

  return (
    <PerformanceMonitor componentName="PostsFeed" threshold={200}>
      <ErrorBoundary>
        <div className="space-y-6">
          {allPosts.map((post) => (
            <ErrorBoundary key={post.id}>
              <Post post={post} />
            </ErrorBoundary>
          ))}
          
          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isFetchingNextPage && (
              <div className="flex items-center space-x-2 text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading more posts...</span>
              </div>
            )}
            {!hasNextPage && allPosts.length > 0 && (
              <p className="text-gray-500 text-sm">You've reached the end</p>
            )}
          </div>
        </div>
      </ErrorBoundary>
    </PerformanceMonitor>
  );
};

export default PostsFeed;
