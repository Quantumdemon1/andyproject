
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, X } from 'lucide-react';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { toast } from '@/components/ui/use-toast';

interface EnhancedMessageComposerProps {
  onSendMessage: (content: string, attachmentUrl?: string, replyToMessageId?: string) => void;
  conversationId: string;
  placeholder?: string;
  replyToMessage?: { id: string; content: string; username: string } | null;
  onCancelReply?: () => void;
}

const EnhancedMessageComposer: React.FC<EnhancedMessageComposerProps> = ({
  onSendMessage,
  conversationId,
  placeholder = "Type a message...",
  replyToMessage,
  onCancelReply
}) => {
  const [message, setMessage] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { startTyping, stopTyping } = useTypingIndicator(conversationId);

  const handleSend = useCallback(() => {
    if (!message.trim() && !attachmentUrl) return;

    onSendMessage(message.trim(), attachmentUrl || undefined, replyToMessage?.id);
    setMessage('');
    setAttachmentUrl('');
    stopTyping();
    
    if (onCancelReply) {
      onCancelReply();
    }
  }, [message, attachmentUrl, replyToMessage?.id, onSendMessage, stopTyping, onCancelReply]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    
    if (value.length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simple file validation
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // For now, we'll use a placeholder URL
      // In a real app, you'd upload to Supabase Storage
      const fakeUrl = `https://placeholder.com/${file.name}`;
      setAttachmentUrl(fakeUrl);
      
      toast({
        title: 'File attached',
        description: `${file.name} has been attached to your message.`
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-t border-white/10 p-4">
      {replyToMessage && (
        <div className="bg-white/5 rounded-lg p-3 mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Replying to {replyToMessage.username}</p>
            <p className="text-sm text-gray-300 truncate">
              {replyToMessage.content.length > 50 
                ? `${replyToMessage.content.substring(0, 50)}...` 
                : replyToMessage.content}
            </p>
          </div>
          {onCancelReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelReply}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {attachmentUrl && (
        <div className="bg-white/5 rounded-lg p-3 mb-3 flex items-center justify-between">
          <span className="text-sm text-gray-300">File attached</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAttachmentUrl('')}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="resize-none border-white/10 bg-white/5 text-white placeholder-gray-400 min-h-[44px] max-h-32"
            rows={1}
          />
        </div>
        
        <div className="flex space-x-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-11 w-11 p-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handleSend}
            disabled={!message.trim() && !attachmentUrl}
            className="h-11 w-11 p-0 bg-aura-purple hover:bg-aura-purple/80"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMessageComposer;
