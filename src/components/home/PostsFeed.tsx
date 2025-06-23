
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPosts } from '@/api/postsApi';
import Post from '@/components/Post';
import { Skeleton } from '@/components/ui/skeleton';
import PostsPagination from './PostsPagination';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import PerformanceMonitor from '@/components/PerformanceMonitor';

interface PostsFeedProps {
  filter?: string;
}

const PostsFeed: React.FC<PostsFeedProps> = ({ filter = 'all' }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts', currentPage, filter],
    queryFn: () => fetchPosts(currentPage, 10, filter),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setRetryCount(0);
    // Prefetch next and previous pages for better UX
    if (data && page < data.totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['posts', page + 1, filter],
        queryFn: () => fetchPosts(page + 1, 10, filter),
        staleTime: 2 * 60 * 1000,
      });
    }
    if (page > 1) {
      queryClient.prefetchQuery({
        queryKey: ['posts', page - 1, filter],
        queryFn: () => fetchPosts(page - 1, 10, filter),
        staleTime: 2 * 60 * 1000,
      });
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
    setRetryCount(0);
  }, [filter]);

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

  if (error) {
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

  if (!data || data.posts.length === 0) {
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
          {filter !== 'all' && (
            <Button
              onClick={() => handlePageChange(1)}
              variant="ghost"
              size="sm"
              className="mt-2 text-aura-blue hover:text-aura-blue/80"
            >
              Refresh
            </Button>
          )}
        </div>
      </PerformanceMonitor>
    );
  }

  return (
    <PerformanceMonitor componentName="PostsFeed" threshold={200}>
      <ErrorBoundary>
        <div>
          <div className="space-y-6">
            {data.posts.map((post) => (
              <ErrorBoundary key={post.id}>
                <Post post={post} />
              </ErrorBoundary>
            ))}
          </div>
          
          <PostsPagination
            currentPage={currentPage}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </div>
      </ErrorBoundary>
    </PerformanceMonitor>
  );
};

export default PostsFeed;
