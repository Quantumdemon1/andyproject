
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useRealTimeUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Listen for new posts
    const postsChannel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('New post:', payload);
          
          // Invalidate posts queries to show new content
          queryClient.invalidateQueries({ queryKey: ['posts'] });
          
          // Show notification for new posts from followed users
          toast({
            title: "New post available",
            description: "Refresh to see the latest content",
            duration: 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Post updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
      )
      .subscribe();

    // Listen for new likes
    const likesChannel = supabase
      .channel('likes-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes'
        },
        (payload) => {
          console.log('New like:', payload);
          queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'likes'
        },
        (payload) => {
          console.log('Like removed:', payload);
          queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
      )
      .subscribe();

    // Listen for new comments
    const commentsChannel = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments'
        },
        (payload) => {
          console.log('New comment:', payload);
          queryClient.invalidateQueries({ queryKey: ['posts'] });
          queryClient.invalidateQueries({ queryKey: ['comments'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [queryClient]);
};
