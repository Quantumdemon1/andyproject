
import React, { useState } from "react";
import { Paperclip, SmilePlus, Send, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import EmojiPicker from "@/components/EmojiPicker";
import FileUpload from "@/components/FileUpload";
import AttachmentPreview from "./AttachmentPreview";

interface MessageComposerProps {
  onSendMessage: (content: string, attachmentUrl?: string, replyToId?: string, threadId?: string) => Promise<void>;
  replyToMessage?: { id: string; content: string; sender_name: string } | null;
  onCancelReply?: () => void;
  threadId?: string;
  isMobile?: boolean;
  placeholder?: string;
  compact?: boolean;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ 
  onSendMessage, 
  replyToMessage,
  onCancelReply,
  threadId,
  isMobile = false,
  placeholder = "Type a message...",
  compact = false
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" && !attachmentUrl) return;
    
    try {
      setIsSending(true);
      await onSendMessage(
        newMessage, 
        attachmentUrl, 
        replyToMessage?.id,
        threadId
      );
      setNewMessage("");
      setAttachmentUrl(undefined);
      if (onCancelReply) onCancelReply();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleFileUploadComplete = (url: string) => {
    setAttachmentUrl(url);
  };

  return (
    <div className={`${isMobile ? 'p-3' : 'p-4'} border-t border-white/10 bg-white/5`}>
      {replyToMessage && (
        <div className="mb-3 p-2 bg-white/5 rounded-md border-l-2 border-aura-purple">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-aura-purple font-medium">
                Replying to {replyToMessage.sender_name}
              </p>
              <p className="text-sm text-gray-300 truncate">
                {replyToMessage.content}
              </p>
            </div>
            {onCancelReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
                onClick={onCancelReply}
              >
                ×
              </Button>
            )}
          </div>
        </div>
      )}

      <AttachmentPreview 
        url={attachmentUrl || ""} 
        onRemove={() => setAttachmentUrl(undefined)} 
      />
      
      <div className="flex gap-2 items-end">
        <div className="flex-1 flex">
          <FileUpload 
            onComplete={handleFileUploadComplete}
            bucket="user-uploads"
          >
            <Button variant="ghost" size="icon" className={`rounded-full ${isMobile ? 'h-8 w-8' : ''}`}>
              <Paperclip className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400`} />
            </Button>
          </FileUpload>
          <Textarea
            placeholder={replyToMessage ? "Type a reply..." : placeholder}
            className="flex-1 bg-white/10 border-white/10 focus-visible:ring-aura-purple resize-none h-10 leading-tight pt-2"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isSending}
          />
          <EmojiPicker onEmojiSelect={handleEmojiSelect}>
            <Button variant="ghost" size="icon" className={`rounded-full ${isMobile ? 'h-8 w-8' : ''}`}>
              <SmilePlus className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400`} />
            </Button>
          </EmojiPicker>
        </div>
        <Button 
          onClick={handleSendMessage} 
          disabled={isSending || (newMessage.trim() === "" && !attachmentUrl)}
          variant="gradient" 
          size="icon" 
          className={`rounded-full ${isMobile ? 'h-8 w-8' : ''}`}
        >
          {isSending ? (
            <Loader2 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} animate-spin`} />
          ) : (
            <Send className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MessageComposer;
