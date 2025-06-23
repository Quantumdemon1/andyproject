
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Calendar } from "lucide-react";
import { createPost } from "@/api/postsApi";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import EnhancedFileUpload from "@/components/upload/EnhancedFileUpload";
import CategorySelector from "@/components/content/CategorySelector";
import TagInput from "@/components/content/TagInput";
import PostScheduler from "@/components/content/PostScheduler";

interface EnhancedPostComposerProps {
  onPostCreated?: () => void;
}

const EnhancedPostComposer: React.FC<EnhancedPostComposerProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createScheduledPost = async (postData: {
    content: string;
    imageUrl?: string;
    videoUrl?: string;
    categoryId?: string;
    tags: string[];
    scheduledFor: Date;
  }) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('scheduled_posts')
      .insert({
        user_id: user.id,
        content: postData.content,
        image_url: postData.imageUrl,
        video_url: postData.videoUrl,
        category_id: postData.categoryId,
        tags: postData.tags,
        scheduled_for: postData.scheduledFor.toISOString()
      });

    if (error) throw error;
  };

  const createPostMutation = useMutation({
    mutationFn: async (data: { 
      content: string; 
      imageUrl?: string; 
      videoUrl?: string;
      categoryId?: string;
      tags: string[];
      scheduledFor?: Date;
    }) => {
      if (data.scheduledFor) {
        await createScheduledPost(data as any);
        return null;
      } else {
        return await createPost(data.content, data.imageUrl, data.videoUrl);
      }
    },
    onSuccess: (post) => {
      // Clear form
      setContent("");
      setUploadedFiles([]);
      setSelectedCategoryId(null);
      setTags([]);
      setScheduledFor(null);
      setShowAdvanced(false);
      
      // Refresh posts list
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      // Call the optional callback
      onPostCreated?.();
      
      const message = scheduledFor ? "Post scheduled successfully!" : "Post created successfully!";
      toast({
        title: "Success",
        description: message,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && uploadedFiles.length === 0) {
      toast({
        title: "Empty post",
        description: "Please add some content or media to your post",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to create a post",
        variant: "destructive",
      });
      return;
    }

    // Determine media URLs
    const imageUrls = uploadedFiles.filter(url => 
      url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );
    const videoUrls = uploadedFiles.filter(url => 
      url.match(/\.(mp4|webm|mov)$/i)
    );

    createPostMutation.mutate({
      content: content.trim() || "",
      imageUrl: imageUrls[0],
      videoUrl: videoUrls[0],
      categoryId: selectedCategoryId || undefined,
      tags,
      scheduledFor: scheduledFor || undefined,
    });
  };

  const handleFilesUploaded = (urls: string[]) => {
    setUploadedFiles(prev => [...prev, ...urls]);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Create a Post</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Simple' : 'Advanced'}
          </Button>
        </div>
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

          {/* File Upload */}
          <EnhancedFileUpload 
            onFilesUploaded={handleFilesUploaded}
            maxFiles={5}
            bucket="post-media"
            acceptedTypes={['image/*', 'video/*']}
            maxSizePerFile={50 * 1024 * 1024} // 50MB for posts
          />

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-4 border-t border-white/10 pt-4">
              <CategorySelector
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={setSelectedCategoryId}
              />
              
              <TagInput
                tags={tags}
                onTagsChange={setTags}
                maxTags={8}
              />
              
              <PostScheduler
                onScheduleChange={setScheduledFor}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {uploadedFiles.length > 0 && (
                <span>{uploadedFiles.length} file(s) attached</span>
              )}
              {scheduledFor && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Scheduled
                </span>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={(!content.trim() && uploadedFiles.length === 0) || createPostMutation.isPending}
              size="sm"
              variant="gradient"
            >
              {createPostMutation.isPending ? (
                "Processing..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  {scheduledFor ? 'Schedule' : 'Post'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedPostComposer;
