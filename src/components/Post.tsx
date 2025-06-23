
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import type { Post as PostType } from '@/api/postsApi';

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Check if user has liked this post
  const { data: userLike } = useQuery({
    queryKey: ['like', post.id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Fetch comments for this post
  const { data: comments = [] } = useQuery({
    queryKey: ['comments', post.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user_profiles(username, avatar_url, display_name)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      if (userLike) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', userLike.id);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: post.id, user_id: user.id });
        if (error) throw error;

        // Create notification for post author
        if (post.user_id !== user.id) {
          await supabase.rpc('create_notification', {
            recipient_id: post.user_id,
            notification_type: 'like',
            notification_title: 'New Like',
            notification_content: `${user.email} liked your post`,
            related_post: post.id,
            related_user: user.id
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['like', post.id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update like',
        variant: 'destructive'
      });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: content.trim()
        });
      
      if (error) throw error;

      // Create notification for post author
      if (post.user_id !== user.id) {
        await supabase.rpc('create_notification', {
          recipient_id: post.user_id,
          notification_type: 'comment',
          notification_title: 'New Comment',
          notification_content: `${user.email} commented on your post`,
          related_post: post.id,
          related_user: user.id
        });
      }
    },
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        variant: 'destructive'
      });
    }
  });

  const handleLike = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to like posts',
        variant: 'destructive'
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to comment',
        variant: 'destructive'
      });
      return;
    }
    if (commentText.trim()) {
      commentMutation.mutate(commentText);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author?.avatar_url} />
              <AvatarFallback>
                {(post.author?.display_name || post.author?.username || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">
                {post.author?.display_name || post.author?.username || 'Unknown User'}
              </p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
          
          {/* Media Content */}
          {post.image_url && (
            <div className="mt-3">
              <img
                src={post.image_url}
                alt="Post content"
                className="rounded-lg max-w-full h-auto"
                loading="lazy"
              />
            </div>
          )}
          
          {post.video_url && (
            <div className="mt-3">
              <video
                src={post.video_url}
                controls
                className="rounded-lg max-w-full h-auto"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className="flex items-center space-x-4 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-2 ${userLike ? 'text-red-500' : 'text-gray-500'}`}
            disabled={likeMutation.isPending}
          >
            <Heart className={`h-4 w-4 ${userLike ? 'fill-current' : ''}`} />
            <span>{post.likes_count || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-500"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments_count || 0}</span>
          </Button>

          <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-500">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            {/* Add Comment Form */}
            {user && (
              <form onSubmit={handleComment} className="mb-4">
                <div className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {(user.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!commentText.trim() || commentMutation.isPending}
                      >
                        {commentMutation.isPending ? 'Posting...' : 'Comment'}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user_profiles?.avatar_url} />
                    <AvatarFallback>
                      {(comment.user_profiles?.display_name || comment.user_profiles?.username || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-sm">
                        {comment.user_profiles?.display_name || comment.user_profiles?.username || 'Unknown User'}
                      </p>
                      <p className="text-gray-900">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Post;
