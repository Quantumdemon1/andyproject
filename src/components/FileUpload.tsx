
import React, { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, X, Upload, File, Image, Video } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface FileUploadProps {
  onComplete: (url: string) => void;
  children: React.ReactNode;
  accept?: string;
  maxSize?: number; // in bytes
  bucket?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onComplete, 
  children, 
  accept = "image/*,video/*,.pdf,.doc,.docx",
  maxSize = 100 * 1024 * 1024, // 100MB default
  bucket = 'user-uploads'
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }

    // Validate file size
    if (selectedFile.size > maxSize) {
      toast({
        title: 'File too large',
        description: `Please select a file smaller than ${Math.round(maxSize / 1024 / 1024)}MB.`,
        variant: 'destructive'
      });
      return;
    }

    setFile(selectedFile);
    setUploadProgress(0);

    // Create preview for supported file types
    if (selectedFile.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    } else {
      setPreview(null);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-8 w-8" />;
    if (fileType.startsWith('video/')) return <Video className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFile = async () => {
    if (!file || !user) {
      toast({
        title: 'Upload failed',
        description: 'Please select a file and ensure you are logged in.',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create filename with user id prefix and timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      console.log('Uploading file to bucket:', bucket, 'with path:', fileName);
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Upload error:', error);
        throw error;
      }
      
      console.log('Upload successful:', data);
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      
      console.log('Public URL:', publicUrlData.publicUrl);
      
      setUploadProgress(100);
      
      // Call the completion callback
      onComplete(publicUrlData.publicUrl);
      
      // Close dialog and reset state
      setIsOpen(false);
      setFile(null);
      setPreview(null);
      setUploadProgress(0);
      
      toast({
        title: 'File uploaded',
        description: 'Your file has been successfully uploaded.'
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'There was an error uploading your file.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      
      // Clean up object URL
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const input = fileInputRef.current;
      if (input) {
        input.files = files;
        handleFileChange({ target: { files } } as any);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-900 border border-white/10 rounded-lg p-6 z-50">
          <Dialog.Title className="text-lg font-medium mb-4 text-white">Upload File</Dialog.Title>
          
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-aura-purple/50 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-40 mx-auto object-contain rounded"
                  />
                  <button
                    className="absolute top-2 right-2 bg-gray-800/80 hover:bg-gray-700 rounded-full p-1"
                    onClick={() => {
                      if (preview) URL.revokeObjectURL(preview);
                      setPreview(null);
                      setFile(null);
                    }}
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : file ? (
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex justify-center mb-2 text-aura-purple">
                      {getFileIcon(file.type)}
                    </div>
                    <p className="font-medium text-white">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-400 mb-2">
                    Drag and drop a file, or click to select
                  </p>
                  <p className="text-xs text-gray-500">
                    Max size: {Math.round(maxSize / 1024 / 1024)}MB
                  </p>
                </>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept={accept}
                disabled={uploading}
              />
            </div>
            
            {uploading && (
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-aura-purple h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                disabled={uploading}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={uploadFile}
                disabled={!file || uploading}
                variant="gradient"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </Button>
            </div>
          </div>
          
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-100"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default FileUpload;
