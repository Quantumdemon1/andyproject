
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, VideoIcon, Send } from "lucide-react";
import { createPost } from "@/api/postsApi";
import { useAuth } from "@/contexts/AuthContext";

const PostComposer = () => {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [showMediaInputs, setShowMediaInputs] = useState(false);
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: (data: { content: string; imageUrl?: string; videoUrl?: string }) =>
      createPost(data.content, data.imageUrl, data.videoUrl),
    onSuccess: () => {
      // Clear form
      setContent("");
      setImageUrl("");
      setVideoUrl("");
      setShowMediaInputs(false);
      
      // Refresh posts list
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    if (!user) return;

    createPostMutation.mutate({
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Create a Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {content.length}/1000
            </div>
          </div>

          {showMediaInputs && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="image-url" className="text-sm font-medium">
                  Image URL (optional)
                </Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="video-url" className="text-sm font-medium">
                  Video URL (optional)
                </Label>
                <Input
                  id="video-url"
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowMediaInputs(!showMediaInputs)}
                className="text-gray-600"
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                Media
              </Button>
            </div>

            <Button 
              type="submit" 
              disabled={!content.trim() || createPostMutation.isPending}
              size="sm"
            >
              {createPostMutation.isPending ? (
                "Posting..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Post
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostComposer;
