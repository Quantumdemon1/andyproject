
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { toggleLike } from '@/api/likesApi';
import { fetchComments, createComment, type Comment } from '@/api/commentsApi';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

interface PostProps {
  post: {
    id: string;
    content: string;
    image_url?: string;
    video_url?: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    author?: {
      username: string;
      avatar_url: string;
      display_name?: string;
    };
    user_id: string;
  };
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', post.id],
    queryFn: () => fetchComments(post.id),
    enabled: showComments,
  });

  // Check if current user has liked this post
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .single();

        setIsLiked(!!data);
      } catch (error) {
        // User hasn't liked this post
        setIsLiked(false);
      }
    };

    checkLikeStatus();
  }, [post.id]);

  const handleLike = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to like posts',
          variant: 'destructive'
        });
        return;
      }

      const wasLiked = await toggleLike(post.id);
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);

      // Create notification for the post author if it's a like (not unlike)
      if (wasLiked && post.user_id !== user.id) {
        await supabase.rpc('create_notification', {
          recipient_id: post.user_id,
          notification_type: 'like',
          notification_title: 'New Like',
          notification_content: `${user.user_metadata?.username || 'Someone'} liked your post`,
          related_post: post.id,
          related_user: user.id
        });
      }

      // Invalidate posts query to update counts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to comment',
          variant: 'destructive'
        });
        return;
      }

      setIsSubmittingComment(true);
      const comment = await createComment(post.id, newComment);
      
      if (comment) {
        setNewComment('');
        
        // Create notification for the post author
        if (post.user_id !== user.id) {
          await supabase.rpc('create_notification', {
            recipient_id: post.user_id,
            notification_type: 'comment',
            notification_title: 'New Comment',
            notification_content: `${user.user_metadata?.username || 'Someone'} commented on your post`,
            related_post: post.id,
            related_user: user.id
          });
        }

        // Invalidate queries to update data
        queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  return (
    <Card className="bg-aura-charcoal border-white/10 overflow-hidden">
      <div className="p-6">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author?.avatar_url} />
              <AvatarFallback>{post.author?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-white">
                {post.author?.display_name || post.author?.username || 'Unknown User'}
              </p>
              <p className="text-sm text-gray-400">@{post.author?.username || 'unknown'} • {timeAgo}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-white whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Post Media */}
        {post.image_url && (
          <div className="mb-4">
            <img 
              src={post.image_url} 
              alt="Post content" 
              className="w-full rounded-lg max-h-96 object-cover"
            />
          </div>
        )}

        {post.video_url && (
          <div className="mb-4">
            <video 
              src={post.video_url} 
              controls 
              className="w-full rounded-lg max-h-96"
            />
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                isLiked ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-gray-400 hover:text-white"
            >
              <Share className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 border-t border-white/10 pt-4">
            {/* Comment Input */}
            <div className="flex space-x-3 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex space-x-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-gray-400 resize-none"
                />
                <Button
                  onClick={handleComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  size="sm"
                  className="bg-aura-blue hover:bg-aura-blue/80"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment: Comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author?.avatar_url} />
                    <AvatarFallback>{comment.author?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="font-medium text-sm text-white mb-1">
                        {comment.author?.display_name || comment.author?.username || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-300">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Post;
