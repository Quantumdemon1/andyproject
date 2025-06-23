
import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  Video, 
  Music, 
  FileText,
  AlertCircle,
  Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface FileUploadItem {
  id: string;
  file: File;
  preview?: string;
  uploadProgress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

interface EnhancedFileUploadProps {
  onFilesUploaded: (urls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSizePerFile?: number; // in bytes
  className?: string;
  bucket?: string;
}

const EnhancedFileUpload: React.FC<EnhancedFileUploadProps> = ({
  onFilesUploaded,
  maxFiles = 10,
  acceptedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/plain'],
  maxSizePerFile = 100 * 1024 * 1024, // 100MB
  className = '',
  bucket = 'user-uploads'
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-6 w-6" />;
    if (file.type.startsWith('video/')) return <Video className="h-6 w-6" />;
    if (file.type.startsWith('audio/')) return <Music className="h-6 w-6" />;
    if (file.type === 'application/pdf') return <FileText className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to upload files',
        variant: 'destructive'
      });
      return;
    }

    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSizePerFile) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds ${formatFileSize(maxSizePerFile)} limit`,
          variant: 'destructive'
        });
        return false;
      }
      return true;
    });

    if (files.length + validFiles.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `Maximum ${maxFiles} files allowed`,
        variant: 'destructive'
      });
      return;
    }

    const newFiles: FileUploadItem[] = await Promise.all(
      validFiles.map(async (file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: await createPreview(file),
        uploadProgress: 0,
        status: 'pending' as const
      }))
    );

    setFiles(prev => [...prev, ...newFiles]);
  }, [user, files.length, maxFiles, maxSizePerFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxSizePerFile,
    multiple: maxFiles > 1
  });

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const uploadFile = async (fileItem: FileUploadItem): Promise<string> => {
    const { file } = fileItem;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

    console.log('Uploading file to bucket:', bucket, 'with path:', fileName);

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

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    console.log('Upload successful, public URL:', publicUrlData.publicUrl);
    
    return publicUrlData.publicUrl;
  };

  const startUpload = async () => {
    if (!user || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i];
        if (fileItem.status !== 'pending') continue;

        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'uploading', uploadProgress: 0 }
            : f
        ));

        try {
          const url = await uploadFile(fileItem);
          uploadedUrls.push(url);

          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'completed', uploadProgress: 100, url }
              : f
          ));
        } catch (error) {
          console.error('Upload error:', error);
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'error', error: 'Upload failed' }
              : f
          ));
        }
      }

      if (uploadedUrls.length > 0) {
        onFilesUploaded(uploadedUrls);
        toast({
          title: 'Upload successful',
          description: `${uploadedUrls.length} file(s) uploaded successfully`
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const clearCompleted = () => {
    setFiles(prev => {
      const completedFiles = prev.filter(f => f.status === 'completed');
      completedFiles.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      return prev.filter(f => f.status !== 'completed');
    });
  };

  const pendingFiles = files.filter(f => f.status === 'pending');
  const completedFiles = files.filter(f => f.status === 'completed');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-aura-blue bg-aura-blue/10' 
                : 'border-white/20 hover:border-white/40'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-aura-blue font-medium">Drop files here...</p>
            ) : (
              <div>
                <p className="text-white font-medium mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-gray-400 text-sm">
                  Images, videos, audio, PDFs up to {formatFileSize(maxSizePerFile)}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Maximum {maxFiles} files
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Files ({files.length})</h3>
              <div className="flex gap-2">
                {completedFiles.length > 0 && (
                  <Button
                    onClick={clearCompleted}
                    variant="ghost"
                    size="sm"
                  >
                    Clear Completed
                  </Button>
                )}
                {pendingFiles.length > 0 && (
                  <Button
                    onClick={startUpload}
                    disabled={isUploading}
                    size="sm"
                    variant="gradient"
                  >
                    {isUploading ? 'Uploading...' : `Upload ${pendingFiles.length} Files`}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                >
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {fileItem.preview ? (
                      <img
                        src={fileItem.preview}
                        alt={fileItem.file.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-white/10 rounded flex items-center justify-center">
                        {getFileIcon(fileItem.file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileItem.file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(fileItem.file.size)}
                    </p>
                    
                    {/* Progress Bar */}
                    {fileItem.status === 'uploading' && (
                      <Progress 
                        value={fileItem.uploadProgress} 
                        className="mt-2 h-1"
                      />
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {fileItem.status === 'pending' && (
                      <Badge variant="outline">Pending</Badge>
                    )}
                    {fileItem.status === 'uploading' && (
                      <Badge variant="outline" className="bg-blue-500/20">
                        Uploading
                      </Badge>
                    )}
                    {fileItem.status === 'completed' && (
                      <Check className="h-5 w-5 text-green-400" />
                    )}
                    {fileItem.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}

                    <Button
                      onClick={() => removeFile(fileItem.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedFileUpload;
