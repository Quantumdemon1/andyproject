
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllPosts, deletePost, restorePost } from '@/api/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, MessageCircle, Heart, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

const AdminPostsTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-posts', currentPage],
    queryFn: () => fetchAllPosts(currentPage, 10),
  });

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const success = await deletePost(postId, 'Admin deletion via admin panel');
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    }
  };

  const handleRestorePost = async (postId: string) => {
    const success = await restorePost(postId, 'Admin restoration via admin panel');
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-400">Error loading posts</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Posts Management</h2>
        <div className="text-sm text-gray-400">
          Total posts: {data?.totalCount || 0}
        </div>
      </div>

      <div className="space-y-4">
        {data?.posts.map((post) => (
          <Card key={post.id} className={`bg-aura-charcoal border-white/10 ${post.is_deleted ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar_url} />
                    <AvatarFallback>{post.author.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">
                      {post.author.display_name || post.author.username}
                    </p>
                    <p className="text-sm text-gray-400">
                      @{post.author.username} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {post.is_deleted && (
                    <Badge variant="destructive">Deleted</Badge>
                  )}
                </div>
                <div className="flex space-x-2">
                  {post.is_deleted ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestorePost(post.id)}
                      className="text-green-400 border-green-400 hover:bg-green-400/10"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white mb-4 whitespace-pre-wrap">{post.content}</p>
              
              {post.image_url && (
                <img 
                  src={post.image_url} 
                  alt="Post content" 
                  className="w-full max-h-64 object-cover rounded-lg mb-4"
                />
              )}
              
              {post.video_url && (
                <video 
                  src={post.video_url} 
                  controls 
                  className="w-full max-h-64 rounded-lg mb-4"
                />
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>ID: {post.id.slice(0, 8)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-white">
            Page {currentPage} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(data.totalPages, prev + 1))}
            disabled={currentPage === data.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminPostsTab;
