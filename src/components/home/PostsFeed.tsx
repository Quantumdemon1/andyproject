
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPosts } from '@/api/postsApi';
import Post from '@/components/Post';
import { Skeleton } from '@/components/ui/skeleton';
import PostsPagination from './PostsPagination';

const PostsFeed = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', currentPage],
    queryFn: () => fetchPosts(currentPage),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Prefetch next and previous pages for better UX
    if (data && page < data.totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['posts', page + 1],
        queryFn: () => fetchPosts(page + 1),
        staleTime: 2 * 60 * 1000,
      });
    }
    if (page > 1) {
      queryClient.prefetchQuery({
        queryKey: ['posts', page - 1],
        queryFn: () => fetchPosts(page - 1),
        staleTime: 2 * 60 * 1000,
      });
    }
  };

  if (isLoading) {
    return (
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
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Failed to load posts. Please try again later.</p>
      </div>
    );
  }

  if (!data || data.posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No posts found. Be the first to create a post!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {data.posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
      
      <PostsPagination
        currentPage={currentPage}
        totalPages={data.totalPages}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
    </div>
  );
};

export default PostsFeed;
