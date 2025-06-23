
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, VideoIcon, Send, X, Upload } from "lucide-react";
import { createPost } from "@/api/postsApi";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const PostComposer = () => {
  const [content, setContent] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [filePreview, setFilePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: (data: { content: string; imageUrl?: string; videoUrl?: string }) =>
      createPost(data.content, data.imageUrl, data.videoUrl),
    onSuccess: () => {
      // Clear form
      setContent("");
      setUploadedFile(null);
      setUploadedFileUrl("");
      setFilePreview("");
      
      // Refresh posts list
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      toast({
        title: "Success",
        description: "Post created successfully!",
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
  };

  const uploadFile = async (file: File): Promise<string> => {
    if (!user) throw new Error('Not authenticated');

    setIsUploading(true);
    try {
      // Create filename with user id prefix and timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('post-media')
        .upload(fileName, file);
      
      if (error) throw error;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('post-media')
        .getPublicUrl(data.path);
      
      return publicUrlData.publicUrl;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && !uploadedFile) {
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

    try {
      let mediaUrl = uploadedFileUrl;
      
      // Upload file if one is selected
      if (uploadedFile && !uploadedFileUrl) {
        mediaUrl = await uploadFile(uploadedFile);
        setUploadedFileUrl(mediaUrl);
      }

      // Determine if it's an image or video
      const isVideo = uploadedFile?.type.startsWith('video/');
      
      createPostMutation.mutate({
        content: content.trim() || "",
        imageUrl: isVideo ? undefined : mediaUrl,
        videoUrl: isVideo ? mediaUrl : undefined,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload media file",
        variant: "destructive",
      });
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadedFileUrl("");
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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

          {/* File Preview */}
          {filePreview && (
            <div className="relative">
              {uploadedFile?.type.startsWith('image/') ? (
                <div className="relative">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="max-h-64 rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : uploadedFile?.type.startsWith('video/') ? (
                <div className="relative">
                  <video
                    src={filePreview}
                    controls
                    className="max-h-64 rounded-lg"
                    preload="metadata"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={triggerFileInput}
                className="text-gray-600"
                disabled={isUploading}
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                {isUploading ? 'Uploading...' : 'Media'}
              </Button>
            </div>

            <Button 
              type="submit" 
              disabled={(!content.trim() && !uploadedFile) || createPostMutation.isPending || isUploading}
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
