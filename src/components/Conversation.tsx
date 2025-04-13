
import React, { useRef, useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Check, CheckCheck, Paperclip, SmilePlus, Send, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Conversation as ConversationType, Message } from "@/hooks/useMessaging";
import EmojiPicker from "./EmojiPicker";
import FileUpload from "./FileUpload";
import MessageActions from "./MessageActions";
import { useAuth } from "@/contexts/AuthContext";

interface ConversationProps {
  currentChat: ConversationType | null;
  messages: Message[];
  sendMessage: (content: string, attachmentUrl?: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  isMobile?: boolean;
}

const MessageStatus = ({ status }: { status: "sent" | "delivered" | "read" }) => {
  if (status === "read") {
    return <CheckCheck className="h-4 w-4 text-blue-400" />;
  } else if (status === "delivered") {
    return <CheckCheck className="h-4 w-4 text-gray-400" />;
  }
  return <Check className="h-4 w-4 text-gray-400" />;
};

const Conversation: React.FC<ConversationProps> = ({ 
  currentChat, 
  messages, 
  sendMessage,
  deleteMessage,
  isMobile = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!currentChat) {
    return null;
  }

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" && !attachmentUrl) return;
    
    try {
      setIsSending(true);
      await sendMessage(newMessage, attachmentUrl);
      setNewMessage("");
      setAttachmentUrl(undefined);
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
    <div className="flex flex-col h-full">
      {/* Header - Hidden on mobile as we're using MainLayout's header */}
      {!isMobile && (
        <div className="flex items-center p-4 border-b border-white/10 bg-white/5">
          <div className="relative">
            <Avatar className="h-10 w-10 border border-white/20">
              <img src={currentChat.avatar_url} alt={currentChat.name} />
            </Avatar>
            {currentChat.is_online && (
              <div className="absolute bottom-0 right-0">
                <div className="h-3 w-3 rounded-full bg-green-500 border-2 border-aura-charcoal"></div>
              </div>
            )}
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">{currentChat.name}</h3>
            <p className="text-xs text-gray-400">
              {currentChat.is_online ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      )}

      {/* Message list */}
      <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'} space-y-4`}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isMe ? "justify-end" : "justify-start"} group`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isMe
                  ? "bg-gradient-to-r from-aura-blue to-aura-purple text-white"
                  : "bg-white/10 text-white"
              }`}
            >
              {message.attachment_url && (
                <div className="mb-2">
                  <a 
                    href={message.attachment_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {message.attachment_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img 
                        src={message.attachment_url} 
                        alt="Attachment" 
                        className="max-h-60 rounded-md object-contain"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 bg-white/10 p-2 rounded-md">
                        <Paperclip className="h-4 w-4" />
                        <span className="text-sm truncate">Attachment</span>
                      </div>
                    )}
                  </a>
                </div>
              )}
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              <div className="text-xs mt-1 flex items-center justify-between">
                <span className="text-gray-300">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
                <div className="flex items-center space-x-2">
                  {message.isMe && (
                    <span>
                      <MessageStatus status={message.status} />
                    </span>
                  )}
                  <MessageActions
                    message={message}
                    onDelete={deleteMessage}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message composer */}
      <div className={`${isMobile ? 'p-3' : 'p-4'} border-t border-white/10 bg-white/5`}>
        {attachmentUrl && (
          <div className="mb-2 p-2 bg-white/10 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <Paperclip className="h-4 w-4 mr-2" />
              <span className="text-sm truncate">File attached</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setAttachmentUrl(undefined)}
            >
              <span className="sr-only">Remove</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path
                  d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                  fill="currentColor"
                ></path>
              </svg>
            </Button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <div className="flex-1 flex">
            <FileUpload onComplete={handleFileUploadComplete}>
              <Button variant="ghost" size="icon" className={`rounded-full ${isMobile ? 'h-8 w-8' : ''}`}>
                <Paperclip className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400`} />
              </Button>
            </FileUpload>
            <Textarea
              placeholder="Type a message..."
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
    </div>
  );
};

export default Conversation;
