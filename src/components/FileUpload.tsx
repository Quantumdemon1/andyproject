
import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, X, Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface FileUploadProps {
  onComplete: (url: string) => void;
  children: React.ReactNode;
}

const FileUpload: React.FC<FileUploadProps> = ({ onComplete, children }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      setPreview(null);
      return;
    }

    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    } else {
      setPreview(null);
    }
  };

  const uploadFile = async () => {
    if (!file || !user) return;

    setUploading(true);
    try {
      // Create filename with user id prefix and original name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file);
      
      if (error) throw error;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(data.path);
      
      onComplete(publicUrlData.publicUrl);
      setIsOpen(false);
      toast({
        title: 'File uploaded',
        description: 'Your file has been attached to the message.'
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your file.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setFile(null);
      setPreview(null);
      
      // Clean up object URL
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-900 border border-white/10 rounded-md p-6">
          <Dialog.Title className="text-lg font-medium mb-4">Upload Attachment</Dialog.Title>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/20 rounded-md p-8 text-center">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-40 mx-auto object-contain"
                  />
                  <button
                    className="absolute top-0 right-0 bg-gray-800/80 rounded-full p-1"
                    onClick={() => {
                      URL.revokeObjectURL(preview);
                      setPreview(null);
                      setFile(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : file ? (
                <div className="flex items-center justify-center bg-white/5 p-4 rounded">
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-400">
                    Drag and drop a file, or click to select
                  </p>
                </>
              )}
              
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                disabled={uploading}
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
