
import React from "react";
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttachmentPreviewProps {
  url: string;
  onRemove?: () => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ 
  url, 
  onRemove 
}) => {
  if (!url) return null;

  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  
  if (isImage) {
    return (
      <div className="mt-2 relative">
        <img 
          src={url} 
          alt="Attachment" 
          className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(url, '_blank')}
        />
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-1 right-1 h-6 w-6 p-0 bg-black/50 hover:bg-black/70"
            onClick={onRemove}
          >
            <span className="sr-only">Remove</span>
            ×
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="mt-2 p-2 bg-white/10 rounded-md flex items-center justify-between">
      <div className="flex items-center">
        <Paperclip className="h-4 w-4 mr-2" />
        <span className="text-sm truncate">File attached</span>
      </div>
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onRemove}
        >
          <span className="sr-only">Remove</span>
          ×
        </Button>
      )}
    </div>
  );
};

export default AttachmentPreview;
